import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { nome, descricao, foto_url } = await request.json()

    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { data, error } = await supabase
      .from("turmas")
      .insert([
        {
          nome,
          descricao,
          professor_id: user.id,
          codigo,
          foto_url,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating turma:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ turma: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/turmas:", error)
    return NextResponse.json({ error: "Erro ao criar turma" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const professor_id = searchParams.get("professor_id")
    const codigo = searchParams.get("codigo")

    if (codigo) {
      const { data: turmaData, error: turmaError } = await supabase
        .from("turmas")
        .select("*")
        .eq("codigo", codigo)
        .maybeSingle()

      if (turmaError) {
        console.error("[v0] Error fetching turma:", turmaError)
        return NextResponse.json({ error: turmaError.message }, { status: 400 })
      }

      if (!turmaData) {
        return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
      }

      const { data: professorData } = await supabase
        .from("profiles")
        .select("nome, foto_url")
        .eq("id", turmaData.professor_id)
        .maybeSingle()

      const result = {
        ...turmaData,
        professor: professorData || null,
      }

      return NextResponse.json({ turma: result })
    }

    let query = supabase.from("turmas").select("*")

    if (professor_id) {
      query = query.eq("professor_id", professor_id)
    }

    const { data: turmasData, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching turmas:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch all professor profiles
    const professorIds = [...new Set(turmasData?.map((t) => t.professor_id) || [])]
    const { data: professorsData } = await supabase.from("profiles").select("id, nome, foto_url").in("id", professorIds)

    const professorsMap = new Map(professorsData?.map((p) => [p.id, p]) || [])

    const turmasWithProfiles = turmasData?.map((turma) => ({
      ...turma,
      professor: professorsMap.get(turma.professor_id) || null,
    }))

    return NextResponse.json({ turmas: turmasWithProfiles })
  } catch (error) {
    console.error("[v0] Error in GET /api/turmas:", error)
    return NextResponse.json({ error: "Erro ao buscar turmas" }, { status: 500 })
  }
}
