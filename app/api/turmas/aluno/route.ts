import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Fetch turma_alunos entries for this student
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("turma_alunos")
      .select("*, turmas(*)")
      .eq("aluno_id", user.id)

    if (enrollmentError) {
      return Response.json({ error: enrollmentError.message }, { status: 400 })
    }

    // Fetch professor profiles for each turma
    const minhasTurmas = await Promise.all(
      (enrollments || []).map(async (enrollment: any) => {
        const turma = enrollment.turmas

        if (turma?.professor_id) {
          const { data: professor } = await supabase
            .from("profiles")
            .select("nome, foto_url")
            .eq("id", turma.professor_id)
            .single()

          return {
            ...enrollment,
            turmas: {
              ...turma,
              professor,
            },
          }
        }

        return enrollment
      }),
    )

    return Response.json({ turmas: minhasTurmas })
  } catch (error) {
    return Response.json({ error: "Erro ao buscar turmas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { aluno_id, turma_id } = await request.json()

    const { data, error } = await supabase.from("turma_alunos").insert([{ aluno_id, turma_id }]).select()

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ error: "Erro ao entrar na turma" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { aluno_id, turma_id } = await request.json()

    const { error } = await supabase.from("turma_alunos").delete().eq("aluno_id", aluno_id).eq("turma_id", turma_id)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Erro ao sair da turma" }, { status: 500 })
  }
}
