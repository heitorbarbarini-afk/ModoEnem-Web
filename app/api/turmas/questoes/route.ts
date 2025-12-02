import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Add question to class
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { turma_id, questao_id } = await request.json()

    const { data, error } = await supabase
      .from("turma_questoes")
      .insert([
        {
          turma_id,
          questao_id,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error adding question to class:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ turma_questao: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/turmas/questoes:", error)
    return NextResponse.json({ error: "Erro ao adicionar questão à turma" }, { status: 500 })
  }
}

// Get questions in a class
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const turma_id = searchParams.get("turma_id")

    if (!turma_id) {
      return NextResponse.json({ error: "turma_id é obrigatório" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("turma_questoes")
      .select(`
        id,
        questao_id,
        added_at,
        questoes (*)
      `)
      .eq("turma_id", turma_id)

    if (error) {
      console.error("[v0] Error fetching class questions:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const questoes = data?.map((item) => item.questoes) || []

    return NextResponse.json({ questoes })
  } catch (error) {
    console.error("[v0] Error in GET /api/turmas/questoes:", error)
    return NextResponse.json({ error: "Erro ao buscar questões da turma" }, { status: 500 })
  }
}

// Remove question from class
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase.from("turma_questoes").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error removing question from class:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/turmas/questoes:", error)
    return NextResponse.json({ error: "Erro ao remover questão da turma" }, { status: 500 })
  }
}
