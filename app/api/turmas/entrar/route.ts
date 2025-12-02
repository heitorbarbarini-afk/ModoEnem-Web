import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { turma_id, aluno_id } = await request.json()

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("turma_alunos")
      .select()
      .eq("turma_id", turma_id)
      .eq("aluno_id", aluno_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Já inscrito nesta turma" }, { status: 400 })
    }

    // Enroll student
    const { data, error } = await supabase
      .from("turma_alunos")
      .insert([
        {
          turma_id,
          aluno_id,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error enrolling student:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ enrollment: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/turmas/entrar:", error)
    return NextResponse.json({ error: "Erro ao entrar na turma" }, { status: 500 })
  }
}
