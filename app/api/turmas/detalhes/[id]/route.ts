import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const supabase = await createClient()

    // Fetch turma details
    const { data: turma, error: turmaError } = await supabase.from("turmas").select("*").eq("id", id).single()

    if (turmaError) {
      return NextResponse.json({ error: turmaError.message }, { status: 400 })
    }

    // Fetch quizzes for this turma with their questions
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select(`
        *,
        quiz_questoes (
          id,
          ordem,
          questoes (*)
        )
      `)
      .eq("turma_id", id)
      .order("created_at", { ascending: false })

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError)
      return NextResponse.json({
        turma: { ...turma, quizzes: [] },
      })
    }

    return NextResponse.json({
      turma: {
        ...turma,
        quizzes: quizzes || [],
      },
    })
  } catch (error) {
    console.error("Error in GET /api/turmas/[id]:", error)
    return NextResponse.json({ error: "Erro ao buscar turma" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const supabase = await createClient()
    const { error } = await supabase.from("turmas").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Turma deletada com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar turma" }, { status: 500 })
  }
}
