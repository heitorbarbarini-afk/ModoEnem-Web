import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const turmaId = searchParams.get("turma_id")

  if (!turmaId) {
    return NextResponse.json({ error: "turma_id is required" }, { status: 400 })
  }

  console.log("[v0] Fetching students for turma:", turmaId)

  const { data, error } = await supabase
    .from("turma_alunos")
    .select(`
      id,
      joined_at,
      aluno_id,
      profiles:aluno_id (
        id,
        nome,
        foto_url
      )
    `)
    .eq("turma_id", turmaId)
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching turma alunos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("[v0] Successfully fetched students:", data)

  return NextResponse.json({ alunos: data })
}
