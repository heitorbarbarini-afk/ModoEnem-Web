import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user, profile })
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const { nome, foto_url } = body

  // Check if profile exists
  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  let result
  if (existingProfile) {
    // Update existing profile
    result = await supabase
      .from("profiles")
      .update({ nome, foto_url, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single()
  } else {
    // Insert new profile
    result = await supabase.from("profiles").insert({ id: user.id, nome, foto_url }).select().single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: result.data })
}
