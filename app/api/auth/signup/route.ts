import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, password, nome, tipo } = await request.json()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          tipo,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Usuário criado com sucesso", user: data.user }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
