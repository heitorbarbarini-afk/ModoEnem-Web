import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { data, error } = await supabase.from("questoes").select().eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ questao: data })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar questão" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { title, theme, level, question, options, correctAnswer, explanation } = await request.json()

    const { data, error } = await supabase
      .from("questoes")
      .update({
        title,
        theme,
        level,
        question,
        options,
        correct_answer: correctAnswer,
        explanation,
      })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ questao: data[0] })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar questão" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { error } = await supabase.from("questoes").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Questão deletada com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar questão" }, { status: 500 })
  }
}
