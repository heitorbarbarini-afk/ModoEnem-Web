import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: turmas, error } = await supabase.from("turmas").select("*").order("created_at", { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    const turmasComProfessor = await Promise.all(
      (turmas || []).map(async (turma: any) => {
        if (turma.professor_id) {
          const { data: professor } = await supabase
            .from("profiles")
            .select("nome, foto_url")
            .eq("id", turma.professor_id)
            .single()

          return {
            ...turma,
            professor,
          }
        }

        return turma
      }),
    )

    return Response.json({ turmas: turmasComProfessor })
  } catch (error) {
    return Response.json({ error: "Erro ao buscar turmas" }, { status: 500 })
  }
}
