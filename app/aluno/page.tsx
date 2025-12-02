"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Users,
  LogOut,
  BarChart3,
  Flame,
  Home,
  History,
  User,
  Upload,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  ClipboardList,
  XCircle,
  Clock,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function AlunoPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [aluno, setAluno] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [view, setView] = useState<
    | "dashboard"
    | "turmas"
    | "quiz"
    | "historico"
    | "perfil"
    | "ver-questoes"
    | "entrar-turma"
    | "tomar-quiz"
    | "overview"
  >("dashboard")
  const [turmas, setTurmas] = useState<any[]>([])
  const [minhasTurmas, setMinhasTurmas] = useState<any[]>([])
  const [codigoTurma, setCodigoTurma] = useState("")
  const [entrandoComCodigo, setEntrandoComCodigo] = useState(false)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [nome, setNome] = useState("")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [turmaSelecionada, setTurmaSelecionada] = useState<any>(null)
  const [questoesDaTurma, setQuestoesDaTurma] = useState<any[]>([])
  const [loadingQuestoes, setLoadingQuestoes] = useState(false)
  const [questaoAtual, setQuestaoAtual] = useState<any | null>(null)
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [resultadoTentativa, setResultadoTentativa] = useState<any>(null)
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now())
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [historico, setHistorico] = useState<any[]>([])

  // Novas variáveis de estado para quizzes
  const [quizzesDaTurma, setQuizzesDaTurma] = useState<any[]>([])
  const [quizAtual, setQuizAtual] = useState<any>(null)
  const [questaoNoQuizAtual, setQuestaoNoQuizAtual] = useState<number>(0)
  const [respostasQuiz, setRespostasQuiz] = useState<{ [key: string]: number }>({})
  const [quizIniciado, setQuizIniciado] = useState(false)
  const [quizFinalizado, setQuizFinalizado] = useState(false)
  const [resultadoQuiz, setResultadoQuiz] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        window.location.href = "/"
        return
      }

      const alunoData = await carregarPerfil(data.user.id)
      if (alunoData) {
        setAluno(alunoData)
        await carregarMinhasTurmas()
        await carregarTurmasDisponiveis()
      }
      await carregarEstatisticas()
      setLoading(false)
    }

    init()
  }, [])

  useEffect(() => {
    if (view === "historico") {
      carregarHistorico()
    }
  }, [view])

  async function carregarTurmasDisponiveis() {
    try {
      const response = await fetch("/api/turmas/disponiveis")
      if (response.ok) {
        const result = await response.json()
        setTurmas(result.turmas || [])
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar turmas disponíveis:", error)
    }
  }

  async function carregarMinhasTurmas() {
    try {
      const response = await fetch("/api/turmas/aluno")

      if (!response.ok) {
        console.error("[v0] Error loading student turmas:", response.status)
        throw new Error(`Erro ao carregar turmas: ${response.status}`)
      }

      const data = await response.json()

      setMinhasTurmas(data.turmas || [])
    } catch (error: any) {
      console.error("[v0] Erro ao carregar minhas turmas:", error.message)
      alert("Erro ao carregar suas turmas. Tente novamente.")
    }
  }

  async function entrarEmTurma(turmaId: string) {
    const response = await fetch("/api/turmas/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turma_id: turmaId, aluno_id: aluno.id }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || "Erro ao entrar na turma.")
    } else {
      alert("Você entrou na turma com sucesso!")
      await carregarTurmasDisponiveis()
      await carregarMinhasTurmas()
    }
  }

  async function entrarComCodigo() {
    if (!codigoTurma.trim()) {
      alert("Por favor, insira um código de turma.")
      return
    }

    setEntrandoComCodigo(true)
    const codigoFormatado = codigoTurma.trim().toUpperCase()

    const response = await fetch(`/api/turmas?codigo=${codigoFormatado}`)
    const result = await response.json()

    if (!response.ok || !result.turma) {
      alert("Código de turma inválido. Verifique e tente novamente.")
      setEntrandoComCodigo(false)
      return
    }

    const turma = result.turma

    const enrollResponse = await fetch("/api/turmas/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turma_id: turma.id, aluno_id: aluno.id }),
    })

    const enrollResult = await enrollResponse.json()

    if (!enrollResponse.ok) {
      alert(enrollResult.error || "Erro ao entrar na turma. Tente novamente.")
    } else {
      alert(`Você entrou na turma "${turma.nome}" com sucesso!`)
      setCodigoTurma("")
      await carregarTurmasDisponiveis()
      await carregarMinhasTurmas() // Removed alunoId parameter as it's already available in scope
    }

    setEntrandoComCodigo(false)
  }

  async function sairDaTurma(turmaId: string) {
    if (!confirm("Tem certeza que deseja sair desta turma?")) return

    const response = await fetch("/api/turmas/aluno", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aluno_id: aluno.id, turma_id: turmaId }),
    })

    if (!response.ok) {
      alert("Erro ao sair da turma. Tente novamente.")
    } else {
      alert("Você saiu da turma.")
      await carregarMinhasTurmas()
      if (turmaSelecionada?.id === turmaId) {
        setTurmaSelecionada(null)
        setQuestoesDaTurma([])
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  async function carregarPerfil(userId: string) {
    const response = await fetch("/api/profile")

    if (response.ok) {
      const result = await response.json()
      if (result.profile) {
        setProfile(result.profile)
        setNome(result.profile.nome || "")
        return result.profile // Return profile data
      }
    }
    return null // Return null if profile not found or error
  }

  async function salvarPerfil() {
    setEditandoPerfil(true)
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        foto_url: profile?.foto_url,
      }),
    })

    if (response.ok) {
      const { profile: updatedProfile } = await response.json()
      setProfile(updatedProfile)
      alert("Perfil atualizado com sucesso!")
    } else {
      alert("Erro ao atualizar perfil.")
    }
    setEditandoPerfil(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const { url } = await response.json()

      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: profile?.nome || nome,
          foto_url: url,
        }),
      })

      if (updateResponse.ok) {
        const { profile: updatedProfile } = await updateResponse.json()
        setProfile(updatedProfile)
        alert("Foto atualizada com sucesso!")
      }
    } else {
      alert("Erro ao fazer upload da foto.")
    }
    setUploadingPhoto(false)
  }

  async function carregarQuestoesDaTurma(turmaId: string) {
    setLoadingQuestoes(true)

    const response = await fetch(`/api/turmas/questoes?turma_id=${turmaId}`)
    const result = await response.json()

    if (response.ok && result.questoes) {
      setQuestoesDaTurma(result.questoes)
    } else {
      setQuestoesDaTurma([])
    }
    setLoadingQuestoes(false)
  }

  async function visualizarTurma(turma: any) {
    if (!turma || !turma.id) {
      console.error("[v0] Invalid turma data:", turma)
      alert("Erro ao carregar turma. Dados inválidos.")
      return
    }
    setTurmaSelecionada(turma)
    setView("ver-questoes")
    await carregarQuestoesDaTurma(turma.id)
  }

  function iniciarQuestao(questao: any) {
    setQuestaoAtual(questao)
    setRespostaSelecionada(null)
    setMostrarResultado(false)
    setResultadoTentativa(null)
    setTempoInicio(Date.now())
  }

  async function submeterResposta() {
    if (respostaSelecionada === null || !questaoAtual || !turmaSelecionada) return

    const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000)

    const response = await fetch("/api/tentativas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questao_id: questaoAtual.id,
        turma_id: turmaSelecionada.id,
        resposta_escolhida: respostaSelecionada,
        tempo_gasto: tempoGasto,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      setResultadoTentativa(result)
      setMostrarResultado(true)
    } else {
      alert("Erro ao submeter resposta: " + result.error)
    }
  }

  function fecharQuestao() {
    setQuestaoAtual(null)
    setRespostaSelecionada(null)
    setMostrarResultado(false)
    setResultadoTentativa(null)
  }

  async function carregarEstatisticas() {
    try {
      const response = await fetch("/api/tentativas?stats=true")
      const result = await response.json()
      if (response.ok) {
        setEstatisticas(result.stats)
      } else {
        console.error("[v0] Erro ao carregar estatísticas:", result.error)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar estatísticas:", error)
    }
  }

  async function carregarHistorico() {
    try {
      const response = await fetch("/api/tentativas")
      const result = await response.json()
      if (response.ok) {
        setHistorico(result.tentativas || [])
      } else {
        console.error("[v0] Erro ao carregar histórico:", result.error)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar histórico:", error)
    }
  }

  // Novas funções para quizzes
  async function carregarQuizzesDaTurma(turmaId: string) {
    console.log("[v0] Loading quizzes for turma:", turmaId)
    const response = await fetch(`/api/turmas/detalhes/${turmaId}`)
    const result = await response.json()

    console.log("[v0] Quiz loading result:", result)

    if (response.ok && result.turma?.quizzes) {
      console.log("[v0] Quizzes found:", result.turma.quizzes.length)
      setQuizzesDaTurma(result.turma.quizzes)
    } else {
      console.log("[v0] No quizzes found")
      setQuizzesDaTurma([])
    }
  }

  async function iniciarQuiz(quiz: any) {
    const response = await fetch(`/api/quizzes/${quiz.id}`)
    const result = await response.json()

    if (response.ok && result.quiz) {
      if (!result.quiz.quiz_questoes || result.quiz.quiz_questoes.length === 0) {
        alert("Este quiz não possui questões. Entre em contato com o professor.")
        return
      }

      setQuizAtual(result.quiz)
      setQuestaoNoQuizAtual(0)
      setRespostasQuiz({})
      setQuizIniciado(true)
      setQuizFinalizado(false)
      setResultadoQuiz(null)
      setView("tomar-quiz")
    } else {
      alert("Erro ao carregar o quiz. Tente novamente.")
    }
  }

  async function responderQuestaodDoQuiz(questaoId: string, resposta: number) {
    setRespostasQuiz({
      ...respostasQuiz,
      [questaoId]: resposta,
    })
  }

  async function proximaQuestao() {
    if (questaoNoQuizAtual < quizAtual.quiz_questoes.length - 1) {
      setQuestaoNoQuizAtual(questaoNoQuizAtual + 1)
    }
  }

  async function questaoAnterior() {
    if (questaoNoQuizAtual > 0) {
      setQuestaoNoQuizAtual(questaoNoQuizAtual - 1)
    }
  }

  async function finalizarQuiz() {
    if (!confirm("Tem certeza que deseja finalizar o quiz? Você não poderá mudar suas respostas.")) {
      return
    }

    // Submeter todas as respostas
    const todasAsQuestoes = quizAtual.quiz_questoes
    let correcoes = 0

    for (const item of todasAsQuestoes) {
      const resposta = respostasQuiz[item.questoes.id]
      if (resposta !== undefined) {
        const response = await fetch("/api/tentativas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questao_id: item.questoes.id,
            turma_id: turmaSelecionada.id,
            quiz_id: quizAtual.id,
            resposta_escolhida: resposta,
            tempo_gasto: 0, // Tempo gasto em quizzes ainda não está implementado aqui
          }),
        })

        const result = await response.json()
        if (result.correta) {
          correcoes++
        }
      }
    }

    const media = Math.round((correcoes / todasAsQuestoes.length) * 100)
    setResultadoQuiz({
      corretas: correcoes,
      total: todasAsQuestoes.length,
      media,
    })
    setQuizFinalizado(true)
  }

  function voltarParaTurmas() {
    setTurmaSelecionada(null)
    setQuizzesDaTurma([])
    setView("turmas")
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* NAVBAR */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Painel do Aluno</h1>
        <div className="flex gap-2">
          <Button onClick={() => setView("dashboard")} variant={view === "dashboard" ? "default" : "outline"}>
            <Home className="w-4 h-4 mr-1" /> Início
          </Button>
          <Button onClick={() => setView("turmas")} variant={view === "turmas" ? "default" : "outline"}>
            <Users className="w-4 h-4 mr-1" /> Turmas
          </Button>
          <Button onClick={() => setView("quiz")} variant={view === "quiz" ? "default" : "outline"}>
            <BookOpen className="w-4 h-4 mr-1" /> Quiz
          </Button>
          <Button onClick={() => setView("historico")} variant={view === "historico" ? "default" : "outline"}>
            <History className="w-4 h-4 mr-1" /> Histórico
          </Button>
          <Button onClick={() => setView("perfil")} variant={view === "perfil" ? "default" : "outline"}>
            <User className="w-4 h-4 mr-1" /> Perfil
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </div>

      {/* DASHBOARD */}
      {view === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{minhasTurmas.length}</p>
                    <p className="text-sm text-muted-foreground">Turmas Inscritas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{estatisticas?.media || 0}%</p>
                    <p className="text-sm text-muted-foreground">Média Geral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {estatisticas?.corretas || 0}/{estatisticas?.total || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Questões Corretas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {estatisticas && estatisticas.total > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-4">Desempenho Geral</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Total de Questões</span>
                    <span className="font-bold text-foreground">{estatisticas.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Acertos</span>
                    <span className="font-bold text-green-600">{estatisticas.corretas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Erros</span>
                    <span className="font-bold text-red-600">{estatisticas.incorretas}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Média de Acertos</span>
                      <span className="text-2xl font-bold text-primary">{estatisticas.media}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* DASHBOARD/OVERVIEW */}
      {view === "overview" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Visão Geral</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{estatisticas?.media || 0}%</p>
                    <p className="text-sm text-muted-foreground">Média Geral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{estatisticas?.corretas || 0}</p>
                    <p className="text-sm text-muted-foreground">de {estatisticas?.total || 0} questões</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {estatisticas && estatisticas.total > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Desempenho Detalhado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium text-foreground">Total de Questões Respondidas</span>
                    <span className="font-bold text-lg text-foreground">{estatisticas.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <span className="text-sm font-medium text-foreground">Acertos</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                      {estatisticas.corretas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <span className="text-sm font-medium text-foreground">Erros</span>
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">{estatisticas.incorretas}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-foreground">Taxa de Acerto</span>
                    <span className="text-3xl font-bold text-primary">{estatisticas.media}%</span>
                  </div>
                  <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${estatisticas.media}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-muted">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Você ainda não respondeu nenhuma questão. Comece respondendo questões para ver suas estatísticas!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TURMAS */}
      {view === "turmas" && (
        <div className="space-y-8">
          {turmaSelecionada ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTurmaSelecionada(null)
                    setQuestoesDaTurma([])
                  }}
                >
                  ← Voltar
                </Button>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{turmaSelecionada.nome}</h2>
                  <p className="text-muted-foreground">{turmaSelecionada.descricao}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Professor:</strong> {turmaSelecionada.profiles?.nome || "Sem nome"}
                  </p>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Questões da Turma</h3>
                  {loadingQuestoes ? (
                    <p className="text-muted-foreground">Carregando questões...</p>
                  ) : questoesDaTurma.length > 0 ? (
                    <div className="space-y-4">
                      {questoesDaTurma.map((q) => (
                        <Card key={q.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-lg">{q.title}</h4>
                              <Badge
                                variant={
                                  q.level === "Fácil" ? "default" : q.level === "Médio" ? "secondary" : "destructive"
                                }
                              >
                                {q.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Tema:</strong> {q.theme}
                            </p>
                            <p className="text-sm mb-3">{q.question}</p>
                            {q.image_url && (
                              <img
                                src={q.image_url || "/placeholder.svg"}
                                alt="Imagem da questão"
                                className="w-full max-w-md rounded-lg mb-3"
                              />
                            )}
                            <div className="space-y-2">
                              {q.options.map((opt: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition"
                                  style={{
                                    border: respostaSelecionada === idx ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                                    backgroundColor: respostaSelecionada === idx ? "#e0f7fa" : "",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="resposta"
                                    checked={respostaSelecionada === idx}
                                    onChange={() => setRespostaSelecionada(idx)}
                                    className="w-5 h-5 accent-primary"
                                  />
                                  <span className="flex-1">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma questão adicionada ainda.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Minhas Turmas</h2>
                <Button variant="outline" onClick={() => setView("entrar-turma")} className="gap-2">
                  <Plus className="h-4 w-4" /> Entrar em Turma
                </Button>
              </div>
              <div className="grid gap-4">
                {minhasTurmas.map((turma) => (
                  <Card key={turma.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        {turma.turmas?.foto_url && (
                          <img
                            src={turma.turmas.foto_url || "/placeholder.svg"}
                            alt={turma.turmas.nome}
                            className="w-20 h-20 rounded-lg object-cover border"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">{turma.turmas?.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Professor: {turma.turmas?.profiles?.nome || "Sem nome"}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">{turma.turmas?.descricao}</p>
                          <Button size="sm" onClick={() => visualizarTurma(turma.turmas)} className="gap-2">
                            <BookOpen className="h-4 w-4" /> Ver Questões
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => sairDaTurma(turma.turma_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* QUIZ LIST VIEW */}
      {view === "quiz" && !turmaSelecionada && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Quizzes</h2>
          <div className="grid gap-4">
            {minhasTurmas.length > 0 ? (
              minhasTurmas.map((turma) => (
                <Card key={turma.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{turma.turmas?.nome}</h3>
                        <p className="text-sm text-muted-foreground">Professor: {turma.turmas?.profiles?.nome}</p>
                      </div>
                      <Button
                        onClick={async () => {
                          setTurmaSelecionada(turma.turmas) // Set turmaSelecionada to the actual turma object
                          await carregarQuizzesDaTurma(turma.turmas.id)
                          setView("quiz") // Mantém na view "quiz", mas agora com turma selecionada
                        }}
                        className="gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Ver Quizzes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-foreground mb-4">Você não está inscrito em nenhuma turma</p>
                <Button onClick={() => setView("entrar-turma")}>Entrar em uma Turma</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TURMA QUIZZES LIST */}
      {view === "quiz" && turmaSelecionada && quizzesDaTurma.length > 0 && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Quizzes - {turmaSelecionada.nome}</h3>
            <Button
              variant="outline"
              onClick={() => {
                setTurmaSelecionada(null)
                setQuizzesDaTurma([])
                setView("quiz") // Volta para a lista geral de quizzes
              }}
            >
              Voltar
            </Button>
          </div>

          <div className="grid gap-4">
            {quizzesDaTurma.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{quiz.titulo}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{quiz.descricao}</p>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">{quiz.quiz_questoes?.length || 0} questões</Badge>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => iniciarQuiz(quiz)} className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Começar Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TOMAR QUIZ */}
      {view === "tomar-quiz" && quizAtual && !quizFinalizado && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{quizAtual.titulo}</h2>
              <p className="text-sm text-muted-foreground">
                Questão {questaoNoQuizAtual + 1} de {quizAtual.quiz_questoes?.length || 0}
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Deseja sair do quiz? Seu progresso será perdido.")) {
                  setQuizIniciado(false)
                  setView("quiz")
                }
              }}
            >
              Sair
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((questaoNoQuizAtual + 1) / (quizAtual.quiz_questoes?.length || 1)) * 100}%`,
              }}
            />
          </div>

          {/* Questão Atual */}
          {quizAtual.quiz_questoes && quizAtual.quiz_questoes[questaoNoQuizAtual] && (
            <Card className="border-2">
              <CardContent className="p-8 space-y-6">
                {(() => {
                  const item = quizAtual.quiz_questoes[questaoNoQuizAtual]
                  const questao = item.questoes
                  const respostaSelecionada = respostasQuiz[questao.id]

                  return (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{questao.title}</h3>
                        <div className="flex gap-2 mb-4">
                          <Badge variant="secondary">{questao.level}</Badge>
                          <Badge variant="outline">{questao.theme}</Badge>
                        </div>
                        <p className="text-lg">{questao.question}</p>
                        {questao.image_url && (
                          <img
                            src={questao.image_url || "/placeholder.svg"}
                            alt="Questão"
                            className="w-full max-w-md rounded-lg mt-4 border"
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Alternativas:</h4>
                        {questao.options.map((opcao: string, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => responderQuestaodDoQuiz(questao.id, idx)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              respostaSelecionada === idx
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  respostaSelecionada === idx ? "border-primary bg-primary" : "border-muted-foreground"
                                }`}
                              >
                                {respostaSelecionada === idx && <Check className="w-4 h-4 text-primary-foreground" />}
                              </div>
                              <span className="text-lg">{opcao}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {questao.explanation && (
                        <div className="bg-secondary/30 p-4 rounded-lg border border-secondary">
                          <p className="text-sm font-semibold text-foreground mb-2">Explicação</p>
                          <p className="text-sm text-muted-foreground">{questao.explanation}</p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={questaoAnterior}
              disabled={questaoNoQuizAtual === 0}
              className="gap-2 bg-transparent"
            >
              ← Anterior
            </Button>

            <div className="flex gap-2">
              {quizAtual.quiz_questoes?.map((_, idx: number) => (
                <Button
                  key={idx}
                  variant={idx === questaoNoQuizAtual ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestaoNoQuizAtual(idx)}
                  className={
                    respostasQuiz[quizAtual.quiz_questoes[idx].questoes.id] !== undefined ? "ring-2 ring-green-500" : ""
                  }
                >
                  {idx + 1}
                </Button>
              ))}
            </div>

            {questaoNoQuizAtual === quizAtual.quiz_questoes.length - 1 ? (
              <Button onClick={finalizarQuiz} className="gap-2">
                <Check className="h-4 w-4" />
                Finalizar Quiz
              </Button>
            ) : (
              <Button onClick={proximaQuestao} className="gap-2">
                Próxima →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* QUIZ RESULTADO */}
      {view === "tomar-quiz" && quizAtual && quizFinalizado && resultadoQuiz && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-primary-foreground">{resultadoQuiz.media}%</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Quiz Finalizado!</h2>
              <p className="text-lg text-muted-foreground">
                Você acertou {resultadoQuiz.corretas} de {resultadoQuiz.total} questões
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b">
                  <span className="text-foreground font-semibold">Total de Questões</span>
                  <span className="font-bold">{resultadoQuiz.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 border-b">
                  <span className="text-foreground font-semibold">Acertos</span>
                  <span className="font-bold text-green-600">{resultadoQuiz.corretas}</span>
                </div>
                <div className="flex justify-between items-center p-3 border-b">
                  <span className="text-foreground font-semibold">Erros</span>
                  <span className="font-bold text-red-600">{resultadoQuiz.total - resultadoQuiz.corretas}</span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-foreground font-semibold">Percentual</span>
                  <span className="font-bold text-primary text-lg">{resultadoQuiz.media}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-center">
            <Button onClick={() => setView("quiz")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Quizzes
            </Button>
          </div>
        </div>
      )}

      {/* HISTÓRICO */}
      {view === "historico" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Histórico de Tentativas</h2>
            <Button variant="outline" onClick={carregarHistorico}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {historico.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-muted">
                    <ClipboardList className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Você ainda não respondeu nenhuma questão. Seu histórico aparecerá aqui!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {historico.map((tentativa) => (
                <Card key={tentativa.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${tentativa.correta ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/30"}`}
                          >
                            {tentativa.correta ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {tentativa.questoes?.title || "Questão"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">{tentativa.questoes?.theme}</p>
                            <div className="flex gap-2 items-center flex-wrap">
                              <Badge variant={tentativa.correta ? "default" : "destructive"}>
                                {tentativa.correta ? "✓ Correta" : "✗ Incorreta"}
                              </Badge>
                              <Badge variant="outline">{tentativa.questoes?.level}</Badge>
                              {tentativa.tempo_gasto && (
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {tentativa.tempo_gasto}s
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(tentativa.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tentativa.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PERFIL */}
      {view === "perfil" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Perfil</h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.foto_url || "/placeholder.svg"} alt={profile?.nome || "Usuário"} />
                  <AvatarFallback className="text-2xl">
                    {profile?.nome?.[0]?.toUpperCase() || aluno?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Upload className="w-4 h-4" />
                      {uploadingPhoto ? "Enviando..." : "Alterar foto"}
                    </div>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF (máx. 5MB)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome" />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={aluno?.email || ""} disabled className="bg-muted" />
              </div>

              <div className="flex gap-2">
                <Button onClick={salvarPerfil} disabled={editandoPerfil}>
                  {editandoPerfil ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QUESTÕES DA TURMA */}
      {view === "ver-questoes" && turmaSelecionada && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Questões - {turmaSelecionada.nome}</h2>
              <p className="text-muted-foreground">{turmaSelecionada.descricao}</p>
            </div>
            <button
              onClick={() => {
                setView("turmas")
                setTurmaSelecionada(null)
              }}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition"
            >
              ← Voltar
            </button>
          </div>

          {loadingQuestoes ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Carregando questões...</p>
            </div>
          ) : questoesDaTurma.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhuma questão disponível nesta turma.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questoesDaTurma.map((questao) => (
                <div
                  key={questao.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {questao.level}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded ml-2">
                        {questao.theme}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{questao.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{questao.question}</p>
                  {questao.image_url && (
                    <img
                      src={questao.image_url || "/placeholder.svg"}
                      alt="Imagem da questão"
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <button
                    onClick={() => iniciarQuestao(questao)}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Responder
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ENTRAR TURMA MODAL */}
      {view === "entrar-turma" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Entrar em uma Turma</h3>
                <button onClick={() => setView("turmas")} className="text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>
              <div>
                <Label htmlFor="codigo-turma">Código da Turma</Label>
                <Input
                  id="codigo-turma"
                  value={codigoTurma}
                  onChange={(e) => setCodigoTurma(e.target.value)}
                  placeholder="Ex: ABC123XYZ"
                  className="mt-1"
                />
              </div>
              <Button onClick={entrarComCodigo} disabled={entrandoComCodigo} className="w-full">
                {entrandoComCodigo ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">Ou use o código fornecido pelo seu professor.</p>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {questaoAtual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {questaoAtual.level}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded ml-2">
                    {questaoAtual.theme}
                  </span>
                </div>
                <button onClick={fecharQuestao} className="text-muted-foreground hover:text-foreground transition">
                  ✕
                </button>
              </div>

              <h3 className="text-xl font-bold mb-4">{questaoAtual.title}</h3>

              {questaoAtual.image_url && (
                <img
                  src={questaoAtual.image_url || "/placeholder.svg"}
                  alt="Imagem da questão"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <p className="text-foreground mb-6">{questaoAtual.question}</p>

              {!mostrarResultado ? (
                <>
                  <div className="space-y-3 mb-6">
                    {questaoAtual.options.map((option: string, index: number) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition"
                        style={{
                          border: respostaSelecionada === index ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                          backgroundColor: respostaSelecionada === index ? "#e0f7fa" : "",
                        }}
                      >
                        <input
                          type="radio"
                          name="resposta"
                          checked={respostaSelecionada === index}
                          onChange={() => setRespostaSelecionada(index)}
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={submeterResposta}
                    disabled={respostaSelecionada === null}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                  >
                    Submeter Resposta
                  </button>
                </>
              ) : (
                <div>
                  <div
                    className={`p-6 rounded-lg mb-4 ${
                      resultadoTentativa.correta
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-red-50 border-2 border-red-200"
                    }`}
                  >
                    <h4
                      className={`text-xl font-bold mb-2 ${resultadoTentativa.correta ? "text-green-700" : "text-red-700"}`}
                    >
                      {resultadoTentativa.correta ? "✓ Correto!" : "✗ Incorreto"}
                    </h4>
                    {!resultadoTentativa.correta && (
                      <p className="text-sm text-foreground/70">
                        Resposta correta: {questaoAtual.options[resultadoTentativa.resposta_correta]}
                      </p>
                    )}
                  </div>

                  {questaoAtual.explanation && (
                    <div className="p-4 bg-muted rounded-lg mb-4">
                      <h5 className="font-semibold mb-2">Explicação:</h5>
                      <p className="text-sm">{questaoAtual.explanation}</p>
                    </div>
                  )}

                  <button
                    onClick={fecharQuestao}
                    className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
