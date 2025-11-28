"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Survey {
  id: number
  title: string
  options: string[]
  active: boolean
  createdAt: Date
}

const mockSurveys: Survey[] = [
  {
    id: 1,
    title: "¿Cuál es tu superhéroe favorito?",
    options: ["Spiderman", "Superman", "Batman", "Thor"],
    active: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    title: "¿Qué género de película prefieres?",
    options: ["Acción", "Comedia", "Drama", "Terror"],
    active: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    title: "¿Cuál es tu plataforma de streaming favorita?",
    options: ["Netflix", "Disney+", "HBO Max", "Prime Video"],
    active: false,
    createdAt: new Date("2024-01-10"),
  },
]

export default function EncuestasPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [surveys, setSurveys] = useState(mockSurveys)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")

  const [surveyForm, setSurveyForm] = useState({
    title: "",
    options: ["", ""],
    active: true,
  })

  const surveysPerPage = 6

  const filteredSurveys =
    filterActive === "all" ? surveys : surveys.filter((s) => (filterActive === "active" ? s.active : !s.active))

  const totalPages = Math.ceil(filteredSurveys.length / surveysPerPage)
  const currentSurveys = filteredSurveys.slice((currentPage - 1) * surveysPerPage, currentPage * surveysPerPage)

  const addOption = () => {
    if (surveyForm.options.length < 4) {
      setSurveyForm({ ...surveyForm, options: [...surveyForm.options, ""] })
    }
  }

  const removeOption = (index: number) => {
    if (surveyForm.options.length > 2) {
      setSurveyForm({ ...surveyForm, options: surveyForm.options.filter((_, i) => i !== index) })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...surveyForm.options]
    newOptions[index] = value
    setSurveyForm({ ...surveyForm, options: newOptions })
  }

  const resetForm = () => {
    setSurveyForm({ title: "", options: ["", ""], active: true })
    setEditingSurvey(null)
  }

  const handleAddSurvey = () => {
    if (!surveyForm.title.trim() || surveyForm.options.some((opt) => !opt.trim())) {
      alert("Por favor completa todos los campos")
      return
    }

    const newSurvey: Survey = {
      id: Math.max(...surveys.map((s) => s.id), 0) + 1,
      title: surveyForm.title,
      options: surveyForm.options.filter((opt) => opt.trim()),
      active: surveyForm.active,
      createdAt: new Date(),
    }

    setSurveys([newSurvey, ...surveys])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditSurvey = () => {
    if (!editingSurvey || !surveyForm.title.trim() || surveyForm.options.some((opt) => !opt.trim())) {
      alert("Por favor completa todos los campos")
      return
    }

    setSurveys(
      surveys.map((s) =>
        s.id === editingSurvey.id
          ? {
              ...s,
              title: surveyForm.title,
              options: surveyForm.options.filter((opt) => opt.trim()),
              active: surveyForm.active,
            }
          : s,
      ),
    )
    resetForm()
    setIsEditDialogOpen(false)
  }

  const openEditDialog = (survey: Survey) => {
    setEditingSurvey(survey)
    setSurveyForm({
      title: survey.title,
      options: [...survey.options],
      active: survey.active,
    })
    setIsEditDialogOpen(true)
  }

  const handleCancelEdit = () => {
    resetForm()
    setIsEditDialogOpen(false)
  }

  const handleDeleteSurvey = (id: number) => {
    setSurveys(surveys.filter((s) => s.id !== id))
  }

  const toggleSurveyStatus = (id: number) => {
    setSurveys(surveys.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader currentPage="encuestas" />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-balance">Gestión de Encuestas</h1>
          <p className="text-muted-foreground text-pretty">
            Crea y administra encuestas para interactuar con tus usuarios.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <Button
              variant={filterActive === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("all")}
            >
              Todas
            </Button>
            <Button
              variant={filterActive === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("active")}
            >
              Activas
            </Button>
            <Button
              variant={filterActive === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("inactive")}
            >
              Inactivas
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  Añadir Encuesta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Encuesta</DialogTitle>
                  <DialogDescription>Define el título y las opciones de respuesta (máximo 4)</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título de la encuesta</Label>
                    <Input
                      id="title"
                      value={surveyForm.title}
                      onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                      placeholder="¿Cuál es tu película favorita?"
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Opciones de respuesta (máximo 4)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        disabled={surveyForm.options.length >= 4}
                        className="gap-1 bg-transparent"
                      >
                        <Plus className="h-3 w-3" />
                        Añadir opción
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {surveyForm.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Opción ${index + 1}`}
                          />
                          {surveyForm.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(index)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="active">Encuesta activa</Label>
                      <p className="text-sm text-muted-foreground">Los usuarios podrán ver y responder esta encuesta</p>
                    </div>
                    <Switch
                      id="active"
                      checked={surveyForm.active}
                      onCheckedChange={(checked) => setSurveyForm({ ...surveyForm, active: checked })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSurvey}>Crear Encuesta</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {currentSurveys.map((survey) => (
            <Card key={survey.id} className="bg-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-balance mb-2">{survey.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={survey.active ? "default" : "secondary"}>
                      {survey.active ? "Activa" : "Inactiva"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {survey.createdAt.toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
                <Switch checked={survey.active} onCheckedChange={() => toggleSurveyStatus(survey.id)} />
              </div>

              <div className="space-y-2">
                {survey.options.map((option, index) => (
                  <div
                    key={index}
                    className="w-full rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                  >
                    {option}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog open={isEditDialogOpen && editingSurvey?.id === survey.id} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 bg-transparent"
                      onClick={() => openEditDialog(survey)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar Encuesta</DialogTitle>
                      <DialogDescription>Modifica el título y las opciones de respuesta (máximo 4)</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-title">Título de la encuesta</Label>
                        <Input
                          id="edit-title"
                          value={surveyForm.title}
                          onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label>Opciones de respuesta (máximo 4)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            disabled={surveyForm.options.length >= 4}
                            className="gap-1 bg-transparent"
                          >
                            <Plus className="h-3 w-3" />
                            Añadir opción
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {surveyForm.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Opción ${index + 1}`}
                              />
                              {surveyForm.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(index)}
                                  className="flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="edit-active">Encuesta activa</Label>
                          <p className="text-sm text-muted-foreground">
                            Los usuarios podrán ver y responder esta encuesta
                          </p>
                        </div>
                        <Switch
                          id="edit-active"
                          checked={surveyForm.active}
                          onCheckedChange={(checked) => setSurveyForm({ ...surveyForm, active: checked })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button onClick={handleEditSurvey}>Guardar Cambios</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleDeleteSurvey(survey.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
