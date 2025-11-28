"use client"

import { useState, useEffect } from "react"
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
import { encuestaService, type Encuesta } from "@/lib/api/services/encuesta.service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"


// ======================================================================
// INTERFACES
// ======================================================================

interface EncuestaUI {
  id: number
  title: string
  options: string[]
  active: boolean
  createdAt: Date

  // campos backend (PascalCase como en el backend)
  idAdmin?: number
  pregunta?: string
  opcion1?: string
  opcion2?: string
  opcion3?: string
  opcion4?: string
  porcentaje1?: number
  porcentaje2?: number
  porcentaje3?: number
  porcentaje4?: number
  activo?: boolean
  fecha?: string
}

// ======================================================================
// COMPONENTE PRINCIPAL
// ======================================================================

export default function EncuestasPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = user?.role === "admin"
  const userId = user?.id ? parseInt(user.id) : null

  const [currentPage, setCurrentPage] = useState(1)
  const [encuestas, setEncuestas] = useState<EncuestaUI[]>([]) // Inicializar vacío
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editandoEncuesta, setEditandoEncuesta] = useState<EncuestaUI | null>(null)
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")
  const [isLoading, setIsLoading] = useState(false)

  const [encuestaForm, setEncuestaForm] = useState({
    title: "",
    options: ["", ""],
    active: true,
  })

  const encuestasPerPage = 6


  // ======================================================================
  // NORMALIZADOR
  // ======================================================================

  const normalizeEncuesta = (encuesta: Encuesta): EncuestaUI => {
    const options = [
      encuesta.opcion1,
      encuesta.opcion2,
      encuesta.opcion3,
      encuesta.opcion4
    ].filter((o): o is string => Boolean(o))

    return {
      id: encuesta.id,
      title: encuesta.pregunta,
      options,
      active: encuesta.activo,
      createdAt: encuesta.fecha ? new Date(encuesta.fecha) : new Date(),

      // backend
      idAdmin: encuesta.idAdmin,
      pregunta: encuesta.pregunta,
      opcion1: encuesta.opcion1,
      opcion2: encuesta.opcion2,
      opcion3: encuesta.opcion3,
      opcion4: encuesta.opcion4,
      porcentaje1: encuesta.porcentaje1,
      porcentaje2: encuesta.porcentaje2,
      porcentaje3: encuesta.porcentaje3,
      porcentaje4: encuesta.porcentaje4,
      activo: encuesta.activo,
      fecha: encuesta.fecha
    }
  }


  // ======================================================================
  // CARGA DESDE BACKEND
  // ======================================================================

  const loadEncuestas = async () => {
    try {
      setIsLoading(true)
      console.log('[loadEncuestas] Iniciando carga de encuestas...')
      const data = await encuestaService.getAll()
      console.log('[loadEncuestas] Datos recibidos del backend:', data)

      const normalizadas = data.map(normalizeEncuesta)
      console.log('[loadEncuestas] Encuestas normalizadas:', normalizadas)
      
      // Solo usar datos del backend
      setEncuestas(normalizadas)
    } catch (err) {
      console.error('[loadEncuestas] Error cargando encuestas:', err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las encuestas del servidor.",
        variant: "destructive"
      })
      // Mantener array vacío en caso de error
      setEncuestas([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEncuestas()
  }, [])


  // ======================================================================
  // FILTROS Y PAGINACIÓN
  // ======================================================================

  const encuestasFiltradas =
    filterActive === "all"
      ? encuestas
      : encuestas.filter(e => filterActive === "active" ? e.active : !e.active)

  const totalPages = Math.ceil(encuestasFiltradas.length / encuestasPerPage)
  const encuestasActuales = encuestasFiltradas.slice(
    (currentPage - 1) * encuestasPerPage,
    currentPage * encuestasPerPage
  )


  // ======================================================================
  // FORMULARIO
  // ======================================================================

  const addOption = () => {
    if (encuestaForm.options.length < 4) {
      setEncuestaForm({ ...encuestaForm, options: [...encuestaForm.options, ""] })
    }
  }

  const removeOption = (index: number) => {
    if (encuestaForm.options.length > 2) {
      setEncuestaForm({ ...encuestaForm, options: encuestaForm.options.filter((_, i) => i !== index) })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...encuestaForm.options]
    newOptions[index] = value
    setEncuestaForm({ ...encuestaForm, options: newOptions })
  }

  const resetForm = () => {
    setEncuestaForm({ title: "", options: ["", ""], active: true })
    setEditandoEncuesta(null)
  }


  // ======================================================================
  // CREAR ENCUESTA
  // ======================================================================

  const handleAddEncuesta = async () => {
    if (!isAdmin || !userId) {
      toast({
        title: "No autorizado",
        description: "Solo los administradores pueden crear encuestas",
        variant: "destructive"
      })
      return
    }

    if (!encuestaForm.title.trim() || encuestaForm.options.some(o => !o.trim())) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      const newId = await encuestaService.create({
        idAdmin: userId,
        pregunta: encuestaForm.title,
        opcion1: encuestaForm.options[0],
        opcion2: encuestaForm.options[1],
        opcion3: encuestaForm.options[2],
        opcion4: encuestaForm.options[3],
        activo: encuestaForm.active
      })

      const nueva: EncuestaUI = {
        id: newId,
        title: encuestaForm.title,
        options: encuestaForm.options.filter(o => o.trim()),
        active: encuestaForm.active,
        createdAt: new Date(),

        idAdmin: userId,
        pregunta: encuestaForm.title,
        opcion1: encuestaForm.options[0],
        opcion2: encuestaForm.options[1],
        opcion3: encuestaForm.options[2],
        opcion4: encuestaForm.options[3],
        porcentaje1: 0,
        porcentaje2: 0,
        porcentaje3: 0,
        porcentaje4: 0,
        activo: encuestaForm.active,
      }

      setEncuestas([nueva, ...encuestas])

      toast({
        title: "Éxito",
        description: "Encuesta creada correctamente"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Encuesta creada localmente (backend caído)",
        variant: "destructive"
      })

      const nuevaLocal: EncuestaUI = {
        id: Math.max(...encuestas.map(e => e.id), 0) + 1,
        title: encuestaForm.title,
        options: encuestaForm.options.filter(o => o.trim()),
        active: encuestaForm.active,
        createdAt: new Date()
      }

      setEncuestas([nuevaLocal, ...encuestas])
    } finally {
      setIsLoading(false)
      resetForm()
      setIsAddDialogOpen(false)
    }
  }


  // ======================================================================
  // EDITAR ENCUESTA
  // ======================================================================

  const handleEditEncuesta = async () => {
    if (!isAdmin || !editandoEncuesta) return

    if (!encuestaForm.title.trim() || encuestaForm.options.some(o => !o.trim())) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      if (editandoEncuesta.idAdmin !== undefined) {
        await encuestaService.update(editandoEncuesta.id, {
          id: editandoEncuesta.id,
          idAdmin: editandoEncuesta.idAdmin,   // Se mantiene
          pregunta: encuestaForm.title,
          opcion1: encuestaForm.options[0],
          opcion2: encuestaForm.options[1],
          opcion3: encuestaForm.options[2],
          opcion4: encuestaForm.options[3],
          porcentaje1: editandoEncuesta.porcentaje1 || 0,
          porcentaje2: editandoEncuesta.porcentaje2 || 0,
          porcentaje3: editandoEncuesta.porcentaje3 || 0,
          porcentaje4: editandoEncuesta.porcentaje4 || 0,
          activo: encuestaForm.active,
          fecha: new Date().toISOString() // Enviar fecha completa en formato ISO
        })
      }

      const now = new Date()
      setEncuestas(encuestas.map(e =>
        e.id === editandoEncuesta.id
          ? {
              ...e,
              title: encuestaForm.title,
              options: encuestaForm.options.filter(o => o.trim()),
              active: encuestaForm.active,
              createdAt: now, // Actualizar fecha mostrada

              pregunta: encuestaForm.title,
              opcion1: encuestaForm.options[0],
              opcion2: encuestaForm.options[1],
              opcion3: encuestaForm.options[2],
              opcion4: encuestaForm.options[3],
              activo: encuestaForm.active,
              fecha: now.toISOString() // Actualizar fecha en formato ISO completo
            }
          : e
      ))

      toast({
        title: "Actualizado",
        description: "Encuesta editada correctamente"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Actualizado localmente (backend caído)",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      resetForm()
      setIsEditDialogOpen(false)
    }
  }


  // ======================================================================
  // BORRAR ENCUESTA
  // ======================================================================

  const handleDeleteEncuesta = async (id: number) => {
    const encuesta = encuestas.find(e => e.id === id)

    try {
      setIsLoading(true)

      if (encuesta?.idAdmin !== undefined) {
        await encuestaService.remove(id)
      }

      setEncuestas(encuestas.filter(e => e.id !== id))

      toast({
        title: "Eliminada",
        description: "Encuesta eliminada correctamente"
      })
    } catch {
      toast({
        title: "Error",
        description: "Eliminada localmente (backend caído)",
        variant: "destructive"
      })

      setEncuestas(encuestas.filter(e => e.id !== id))
    } finally {
      setIsLoading(false)
    }
  }


  // ======================================================================
  // ACTIVAR / DESACTIVAR
  // ======================================================================

  const toggleEncuestaStatus = async (id: number) => {
    const encuesta = encuestas.find(e => e.id === id)
    if (!encuesta) return

    const newStatus = !encuesta.active

    try {
      if (encuesta.idAdmin !== undefined) {
        
        // Usar exactamente los mismos datos que ya tiene la encuesta
        const updatePayload = {
          id: encuesta.id,
          idAdmin: encuesta.idAdmin,
          pregunta: encuesta.pregunta || encuesta.title, // Asegurar que pregunta no sea undefined
          opcion1: encuesta.opcion1 || encuesta.options[0] || "", // Asegurar que opcion1 no sea undefined
          opcion2: encuesta.opcion2 || encuesta.options[1] || "", // Asegurar que opcion2 no sea undefined
          opcion3: encuesta.opcion3 || encuesta.options[2] || "",
          opcion4: encuesta.opcion4 || encuesta.options[3] || "",
          porcentaje1: encuesta.porcentaje1 || 0,
          porcentaje2: encuesta.porcentaje2 || 0,
          porcentaje3: encuesta.porcentaje3 || 0,
          porcentaje4: encuesta.porcentaje4 || 0,
          activo: newStatus, // Solo cambiar este campo
          fecha: encuesta.fecha || new Date().toISOString()
        }
        
        await encuestaService.update(id, updatePayload)
      }

      // Actualizar el estado local inmediatamente para feedback visual
      const now = new Date()
      setEncuestas(encuestas.map(e =>
        e.id === id ? { 
          ...e, 
          active: newStatus, 
          activo: newStatus,
          createdAt: now,
          fecha: now.toISOString()
        } : e
      ))

      console.log(`[toggleEncuestaStatus] Encuesta ${id} actualizada exitosamente a estado: ${newStatus}`)
    
      // REFRESCAR POR SI HAY CAMBIOS
      setTimeout(async () => {
        await loadEncuestas()
      }, 2000) // Aumentar a 3 segundos si se descomenta
      
      toast({
        title: "Estado actualizado",
        description: newStatus ? "Encuesta activada" : "Encuesta desactivada"
      })
    } catch {
      toast({
        title: "Error",
        description: "Actualizado localmente (backend caído)",
        variant: "destructive"
      })

      setEncuestas(encuestas.map(e =>
        e.id === id ? { ...e, active: newStatus } : e
      ))
    }
  }


  // ======================================================================
  // RENDER UI
  // ======================================================================

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader currentPage="encuestas" />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold">Gestión de Encuestas</h1>
          <p className="text-muted-foreground">
            Crea y administra encuestas para interactuar con tus usuarios.
          </p>
        </div>

        {/* Filtros y botón crear */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">

          {/* Filtros */}
          <div className="flex gap-2">
            <Button variant={filterActive === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterActive("all")}>Todas</Button>
            <Button variant={filterActive === "active" ? "default" : "outline"} size="sm" onClick={() => setFilterActive("active")}>Activas</Button>
            <Button variant={filterActive === "inactive" ? "default" : "outline"} size="sm" onClick={() => setFilterActive("inactive")}>Inactivas</Button>
          </div>

          {/* Crear encuesta */}
          <div className="flex items-center gap-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}>
                  <Plus className="h-4 w-4" /> Añadir Encuesta
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Encuesta</DialogTitle>
                  <DialogDescription>Define el título y las opciones (máximo 4)</DialogDescription>
                </DialogHeader>

                {/* FORM */}
                <div className="grid gap-6 py-4">

                  {/* título */}
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título de la encuesta</Label>
                    <Input
                      id="title"
                      value={encuestaForm.title}
                      onChange={(e) => setEncuestaForm({ ...encuestaForm, title: e.target.value })}
                      placeholder="¿Cuál es tu película favorita?"
                    />
                  </div>

                  {/* opciones */}
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Opciones de respuesta</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        disabled={encuestaForm.options.length >= 4}
                      >
                        <Plus className="h-3 w-3" /> Añadir opción
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {encuestaForm.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Opción ${idx + 1}`}
                          />
                          {encuestaForm.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* activo */}
                  <div className="flex items-center justify-between">
                    <Label>Encuesta activa</Label>
                    <Switch
                      checked={encuestaForm.active}
                      onCheckedChange={(checked) => setEncuestaForm({ ...encuestaForm, active: checked })}
                    />
                  </div>
                </div>

                {/* botones */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false) }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddEncuesta} disabled={isLoading}>
                    {isLoading ? "Creando..." : "Crear Encuesta"}
                  </Button>
                </div>

              </DialogContent>
            </Dialog>
          </div>
        </div>


        {/* ENCUESTAS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {encuestasActuales.map((encuesta) => (
            <Card key={encuesta.id} className="bg-card p-6 space-y-4">

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{encuesta.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={encuesta.active ? "default" : "secondary"}>
                      {encuesta.active ? "Activa" : "Inactiva"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {encuesta.createdAt.toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                <Switch checked={encuesta.active} onCheckedChange={() => toggleEncuestaStatus(encuesta.id)} />
              </div>

              {/* opciones con porcentajes */}
              <div className="space-y-2">
                {encuesta.options.map((opt, i) => {
                  const porcentaje = i === 0 ? encuesta.porcentaje1 : 
                                   i === 1 ? encuesta.porcentaje2 : 
                                   i === 2 ? encuesta.porcentaje3 : 
                                   encuesta.porcentaje4;
                  return (
                    <div key={i} className="w-full rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary flex justify-between items-center">
                      <span>{opt}</span>
                      <Badge variant="secondary" className="ml-2">
                        {porcentaje || 0} votos
                      </Badge>
                    </div>
                  )
                })}
              </div>

              {/* botones */}
              <div className="flex gap-2 pt-2">

                {/* editar */}
                <Dialog open={isEditDialogOpen && editandoEncuesta?.id === encuesta.id}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        setEditandoEncuesta(encuesta)
                        setEncuestaForm({
                          title: encuesta.title,
                          options: [...encuesta.options],
                          active: encuesta.active
                        })
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" /> Editar
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar Encuesta</DialogTitle>
                      <DialogDescription>Modifica el contenido de la encuesta</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">

                      {/* titulo */}
                      <div className="grid gap-2">
                        <Label htmlFor="edit-title">Título</Label>
                        <Input
                          id="edit-title"
                          value={encuestaForm.title}
                          onChange={(e) => setEncuestaForm({ ...encuestaForm, title: e.target.value })}
                        />
                      </div>

                      {/* opciones */}
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label>Opciones</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            disabled={encuestaForm.options.length >= 4}
                          >
                            <Plus className="h-3 w-3" /> Añadir opción
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {encuestaForm.options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => updateOption(idx, e.target.value)}
                              />
                              {encuestaForm.options.length > 2 && (
                                <Button variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* activo */}
                      <div className="flex items-center justify-between">
                        <Label>Activa</Label>
                        <Switch
                          checked={encuestaForm.active}
                          onCheckedChange={(checked) => setEncuestaForm({ ...encuestaForm, active: checked })}
                        />
                      </div>
                    </div>

                    {/* botones */}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false) }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleEditEncuesta} disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </div>

                  </DialogContent>
                </Dialog>

                {/* eliminar */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => {
                    if (confirm("¿Seguro que deseas eliminar esta encuesta?")) {
                      handleDeleteEncuesta(encuesta.id)
                    }
                  }}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  {isLoading ? "..." : "Eliminar"}
                </Button>

              </div>
            </Card>
          ))}

        </div>
      </main>
    </div>
  )
}
