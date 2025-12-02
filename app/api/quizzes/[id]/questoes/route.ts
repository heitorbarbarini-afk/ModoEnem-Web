import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: quizId } = await params
  const { questaoId } = await request.json()

  // Get current max ordem
  const { data: maxOrdem } = await supabase
    .from("quiz_questoes")
    .select("ordem")
    .eq("quiz_id", quizId)
    .order("ordem", { ascending: false })
    .limit(1)
    .single()

  const nextOrdem = maxOrdem ? maxOrdem.ordem + 1 : 0

  const { data, error } = await supabase
    .from("quiz_questoes")
    .insert({
      quiz_id: quizId,
      questao_id: questaoId,
      ordem: nextOrdem,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: quizId } = await params
  const { searchParams } = new URL(request.url)
  const questaoId = searchParams.get("questaoId")

  if (!questaoId) {
    return NextResponse.json({ error: "questaoId é obrigatório" }, { status: 400 })
  }

  const { error } = await supabase.from("quiz_questoes").delete().eq("quiz_id", quizId).eq("questao_id", questaoId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
