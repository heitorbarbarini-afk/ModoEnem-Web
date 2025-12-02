import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { title, theme, level, question, options, correctAnswer, explanation, image_url } = await request.json()

    const { data, error } = await supabase
      .from("questoes")
      .insert([
        {
          professor_id: user.id,
          title,
          theme,
          level,
          question,
          options,
          correct_answer: correctAnswer,
          explanation,
          image_url,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating question:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ questao: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/questoes:", error)
    return NextResponse.json({ error: "Erro ao criar questão" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get("theme")
    const professor_id = searchParams.get("professor_id")

    let query = supabase.from("questoes").select()

    if (theme) {
      query = query.eq("theme", theme)
    }

    if (professor_id) {
      query = query.eq("professor_id", professor_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching questions:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ questoes: data })
  } catch (error) {
    console.error("[v0] Error in GET /api/questoes:", error)
    return NextResponse.json({ error: "Erro ao buscar questões" }, { status: 500 })
  }
}
