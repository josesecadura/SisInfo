"use client"

import { useState, useEffect } from "react"
import { AuthRequired } from "@/components/auth-required"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy } from "lucide-react"
import { apiKeyService, type ApiKey } from "@/lib/api/services/apikey.service"
import { useToast } from "@/hooks/use-toast"

export default function ApiKeyPage() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({})
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  
  const [apiKeyForm, setApiKeyForm] = useState({
    nombre: "",
    direccion: ""
  })

  // ======================================================================
  // CARGAR API KEYS DESDE BACKEND
  // ======================================================================

  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      console.log('[loadApiKeys] Cargando API keys...')
      const keys = await apiKeyService.getAll()
      console.log('[loadApiKeys] API keys cargadas:', keys)
      setApiKeys(keys)
    } catch (err) {
      console.error('[loadApiKeys] Error:', err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las API keys del servidor",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApiKeys()
  }, [])

  // ======================================================================
  // FORMULARIO
  // ======================================================================

  const resetForm = () => {
    setApiKeyForm({ nombre: "", direccion: "" })
    setEditingKey(null)
    setShowEditPassword(false)
    setShowCreatePassword(false)
  }

  const handleAddApiKey = async () => {
    if (!apiKeyForm.nombre.trim() || !apiKeyForm.direccion.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const newId = await apiKeyService.create({
        nombre: apiKeyForm.nombre,
        direccion: apiKeyForm.direccion
      })

      const newKey: ApiKey = {
        id: newId,
        nombre: apiKeyForm.nombre,
        direccion: apiKeyForm.direccion,
        fecha: new Date().toISOString()
      }

      setApiKeys([newKey, ...apiKeys])
      
      toast({
        title: "Éxito",
        description: "API Key creada correctamente"
      })

      resetForm()
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('Error al crear API key:', err)
      toast({
        title: "Error",
        description: "Error al crear la API key",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditApiKey = async () => {
    if (!editingKey || !apiKeyForm.nombre.trim() || !apiKeyForm.direccion.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      await apiKeyService.update(editingKey.id, {
        id: editingKey.id,
        nombre: apiKeyForm.nombre,
        direccion: apiKeyForm.direccion
      })

      setApiKeys(apiKeys.map(key =>
        key.id === editingKey.id
          ? { ...key, nombre: apiKeyForm.nombre, direccion: apiKeyForm.direccion }
          : key
      ))

      toast({
        title: "Actualizada",
        description: "API Key editada correctamente"
      })

      resetForm()
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Error al editar API key:', err)
      toast({
        title: "Error",
        description: "Error al editar la API key",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteApiKey = async (id: number) => {
    try {
      setIsLoading(true)
      await apiKeyService.remove(id)
      
      setApiKeys(apiKeys.filter(key => key.id !== id))
      
      toast({
        title: "Eliminada",
        description: "API Key eliminada correctamente"
      })
    } catch (err) {
      console.error('Error al eliminar API key:', err)
      toast({
        title: "Error",
        description: "Error al eliminar la API key",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ======================================================================
  // UTILIDADES
  // ======================================================================

  const toggleKeyVisibility = (id: number) => {
    setVisibleKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "API Key copiada al portapapeles"
    })
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "****"
    return key.substring(0, 4) + "****" + key.substring(key.length - 4)
  }

  // ======================================================================
  // RENDER
  // ======================================================================

  return (
    <AuthRequired requireAdmin={true}>
      <div className="min-h-screen bg-background">
        <AdminHeader currentPage="api-key" />
        
        <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold">Gestión de API Keys</h1>
          <p className="text-muted-foreground">
            Administra las claves API para servicios externos
          </p>
        </div>

        {/* Botón crear */}
        <div className="mb-8 flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" /> Añadir API Key
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva API Key</DialogTitle>
                <DialogDescription>Añade una nueva clave API para servicios externos</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del servicio</Label>
                  <Input
                    id="nombre"
                    value={apiKeyForm.nombre}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, nombre: e.target.value })}
                    placeholder="TMDB, YouTube, etc."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="direccion">Clave API</Label>
                  <div className="relative">
                    <Input
                      id="direccion"
                      type={showCreatePassword ? "text" : "password"}
                      value={apiKeyForm.direccion}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, direccion: e.target.value })}
                      placeholder="Introduce la clave API"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false) }}>
                  Cancelar
                </Button>
                <Button onClick={handleAddApiKey} disabled={isLoading}>
                  {isLoading ? "Creando..." : "Crear API Key"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de API Keys */}
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {apiKeys.length === 0 && !isLoading && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No hay API keys configuradas</p>
              <p className="text-sm text-muted-foreground mt-2">Añade tu primera clave API para comenzar</p>
            </Card>
          )}

          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{apiKey.nombre}</h3>
                    <Badge variant="outline">Activa</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Label className="text-sm font-medium pt-1">Clave:</Label>
                      <div className="flex-1 min-w-0 space-y-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all whitespace-pre-wrap inline-block max-w-full">
                          {visibleKeys[apiKey.id] ? apiKey.direccion : maskApiKey(apiKey.direccion)}
                        </code>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.direccion)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {apiKey.fecha && (
                      <p className="text-xs text-muted-foreground">
                        Creada: {new Date(apiKey.fecha).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  {/* Editar */}
                  <Dialog open={isEditDialogOpen && editingKey?.id === apiKey.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingKey(apiKey)
                          setApiKeyForm({
                            nombre: apiKey.nombre,
                            direccion: apiKey.direccion
                          })
                          setShowEditPassword(false)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar API Key</DialogTitle>
                        <DialogDescription>Modifica la información de la clave API</DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-nombre">Nombre del servicio</Label>
                          <Input
                            id="edit-nombre"
                            value={apiKeyForm.nombre}
                            onChange={(e) => setApiKeyForm({ ...apiKeyForm, nombre: e.target.value })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="edit-direccion">Clave API</Label>
                          <div className="relative">
                            <Input
                              id="edit-direccion"
                              type={showEditPassword ? "text" : "password"}
                              value={apiKeyForm.direccion}
                              onChange={(e) => setApiKeyForm({ ...apiKeyForm, direccion: e.target.value })}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowEditPassword(!showEditPassword)}
                            >
                              {showEditPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false) }}>
                          Cancelar
                        </Button>
                        <Button onClick={handleEditApiKey} disabled={isLoading}>
                          {isLoading ? "Guardando..." : "Guardar cambios"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Eliminar */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("¿Seguro que deseas eliminar esta API key?")) {
                        handleDeleteApiKey(apiKey.id)
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
      </div>
    </AuthRequired>
  )
}
