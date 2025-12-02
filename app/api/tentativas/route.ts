import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Submit a student's attempt at a question
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { questao_id, turma_id, quiz_id, resposta_escolhida, tempo_gasto } = await request.json()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get the question to check correct answer
    const { data: questao, error: questaoError } = await supabase
      .from("questoes")
      .select("correct_answer")
      .eq("id", questao_id)
      .single()

    if (questaoError || !questao) {
      return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 })
    }

    const correta = questao.correct_answer === resposta_escolhida

    // Insert attempt
    const { data, error } = await supabase
      .from("tentativas")
      .insert([
        {
          aluno_id: user.id,
          questao_id,
          turma_id,
          quiz_id,
          resposta_escolhida,
          correta,
          tempo_gasto,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error submitting attempt:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        tentativa: data[0],
        correta,
        resposta_correta: questao.correct_answer,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error in POST /api/tentativas:", error)
    return NextResponse.json({ error: "Erro ao submeter tentativa" }, { status: 500 })
  }
}

// Get attempts for a student in a class
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const turma_id = searchParams.get("turma_id")
    const aluno_id = searchParams.get("aluno_id")
    const stats = searchParams.get("stats") === "true"

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    if (stats) {
      const targetAlunoId = aluno_id || user.id

      // Get statistics
      const { data, error } = await supabase
        .from("tentativas")
        .select("correta, turma_id")
        .eq("aluno_id", targetAlunoId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const total = data.length
      const corretas = data.filter((t) => t.correta).length
      const media = total > 0 ? Math.round((corretas / total) * 100) : 0

      return NextResponse.json({
        stats: {
          total,
          corretas,
          incorretas: total - corretas,
          media,
        },
      })
    }

    let query = supabase
      .from("tentativas")
      .select(
        `
        id,
        questao_id,
        turma_id,
        quiz_id,
        resposta_escolhida,
        correta,
        tempo_gasto,
        created_at,
        questoes (
          title,
          theme,
          level,
          question
        ),
        profiles:aluno_id (
          nome
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (turma_id) {
      query = query.eq("turma_id", turma_id)
    }

    if (aluno_id) {
      query = query.eq("aluno_id", aluno_id)
    } else {
      // If no aluno_id specified, show only current user's attempts
      query = query.eq("aluno_id", user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching attempts:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ tentativas: data })
  } catch (error) {
    console.error("[v0] Error in GET /api/tentativas:", error)
    return NextResponse.json({ error: "Erro ao buscar tentativas" }, { status: 500 })
  }
}
