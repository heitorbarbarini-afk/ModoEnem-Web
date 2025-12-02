import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      async get(name: string) {
        return (await cookies()).get(name)?.value
      },
      async set() {},
      async remove() {},
    },
  })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `turmas/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("avatars").upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("[v0] Error uploading turma foto:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("[v0] Error in upload:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
