"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import { useState } from "react"

interface CriarTurmaFormProps {
  professorId: string
  onSuccess: (turma: any) => void
  onCancel: () => void
}

export function CriarTurmaForm({ professorId, onSuccess, onCancel }: CriarTurmaFormProps) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/turmas/upload-foto", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da foto")
      }

      const { url } = await response.json()
      setFotoUrl(url)
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao fazer upload da foto")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFoto = () => {
    setFotoUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      alert("Por favor, insira o nome da turma")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/turmas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
          professor_id: professorId,
          foto_url: fotoUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar turma")
      }

      const { turma } = await response.json()
      onSuccess(turma)
    } catch (error) {
      console.error("Erro ao criar turma:", error)
      alert("Erro ao criar turma")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="foto">Foto da Turma (Opcional)</Label>
        <div className="flex items-center gap-4">
          {fotoUrl ? (
            <div className="relative">
              <img
                src={fotoUrl || "/placeholder.svg"}
                alt="Foto da turma"
                className="h-24 w-24 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveFoto}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="foto-upload"
              className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <input
                id="foto-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoUpload}
                disabled={isUploading}
              />
            </label>
          )}
          {isUploading && <span className="text-sm text-muted-foreground">Fazendo upload...</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Turma *</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Matemática 3º Ano"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva sobre o que é a turma..."
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? "Criando..." : "Criar Turma"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
