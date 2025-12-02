import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const turmaId = searchParams.get("turmaId")

  if (!turmaId) {
    return NextResponse.json({ error: "turmaId é obrigatório" }, { status: 400 })
  }

  // Get quizzes with question count
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      quiz_questoes(count)
    `)
    .eq("turma_id", turmaId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching quizzes:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ quizzes })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { turmaId, titulo, descricao } = await request.json()

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      turma_id: turmaId,
      professor_id: user.id,
      titulo,
      descricao,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating quiz:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ quiz: data })
}
