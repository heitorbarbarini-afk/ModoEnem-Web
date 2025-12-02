import { supabase } from "@/lib/supabaseClient"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Logout realizado com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 })
  }
}
