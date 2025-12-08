"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { listService } from "@/lib/api/services/list.service"
import { useRouter } from "next/navigation"

interface ListsSectionProps {
  userId: string | number
}

export function ListsSection({ userId }: ListsSectionProps) {
  const [lists, setLists] = useState<any[]>([])
  const [listsLoaded, setListsLoaded] = useState(false)
  const [newListNameProfile, setNewListNameProfile] = useState("")
  const [newListImageFile, setNewListImageFile] = useState<File | null>(null)
  const [createListOpen, setCreateListOpen] = useState(false)
  const [deleteListDialog, setDeleteListDialog] = useState({ open: false, listId: null as number | null, listName: "" })
  const router = useRouter()

  useEffect(() => {
    const loadLists = async () => {
      try {
        let loaded: any[] = []
        if (localStorage.getItem("authToken")) {
          const profileData = JSON.parse(localStorage.getItem("fylt_user") || "{}")
          if (profileData.id) {
            const res = await listService.getByUserId(profileData.id)
            loaded = Array.isArray(res) ? res : []
          }
        }
        
        if (!loaded || loaded.length === 0) {
          try {
            const stored = localStorage.getItem("fylt_user")
            if (stored) {
              const parsed = JSON.parse(stored)
              loaded = parsed.lists ?? parsed.listas ?? []
            }
          } catch (e) {
            console.warn("Error parseando datos locales:", e)
            loaded = []
          }
        }
        
        setLists(loaded || [])
      } catch (e) {
        console.error("Error cargando listas:", e)
        try {
          const stored = localStorage.getItem("fylt_user")
          if (stored) {
            const parsed = JSON.parse(stored)
            const localLists = parsed.lists ?? parsed.listas ?? []
            setLists(localLists)
          } else {
            setLists([])
          }
        } catch (localError) {
          console.error("Error con datos locales también:", localError)
          setLists([])
        }
      } finally {
        setListsLoaded(true)
      }
    }

    loadLists()
  }, [userId])

  const handleListClick = (listaId: number) => {
    router.push(`/listas/${listaId}`)
  }

  const handleDeleteList = async (listId: number) => {
    try {
      await listService.delete(listId)
      const refreshed = await listService.getByUserId(userId)
      setLists(Array.isArray(refreshed) ? refreshed : [])
      setDeleteListDialog({ open: false, listId: null, listName: "" })
    } catch (e) {
      console.error("Error eliminando lista:", e)
    }
  }

  const handleCreateList = async () => {
    if (!newListNameProfile.trim()) return
    const imageUrl = newListImageFile
      ? await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(newListImageFile)
        })
      : "/icon_lista_default.png"
    try {
      await listService.createWithUser(userId, { Nombre: newListNameProfile.trim(), Imagen: imageUrl })
      const refreshed = await listService.getByUserId(userId)
      setLists(Array.isArray(refreshed) ? refreshed : [])
      setNewListNameProfile("")
      setNewListImageFile(null)
      setCreateListOpen(false)
    } catch (e) {
      console.error("Error:", e)
    }
  }

  return (
    <>
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Listas</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setCreateListOpen(true)}>+ Nueva Lista</Button>
          </div>
        </div>

        {!listsLoaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-muted-foreground">Cargando listas...</span>
          </div>
        ) : (
          <div>
            {lists && lists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {lists.map((l: any) => (
                  <div key={l.id} className="group relative">
                    <div 
                      className="cursor-pointer" 
                      onClick={() => handleListClick(l.id)}
                    >
                      <div className="relative aspect-2/3 rounded-lg overflow-hidden border-2 border-primary/50 bg-muted mb-3 transition-all group-hover:border-primary group-hover:scale-105">
                        <Image 
                          src={(l.imagen ?? l.Imagen ?? l.image ?? l.imagenBase64 ?? l.imageBase64) || "/icon_lista_default.png"} 
                          alt={l.nombre ?? l.Nombre ?? l.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <p className="text-center font-medium text-sm md:text-base">
                        {l.nombre ?? l.Nombre ?? l.name}
                      </p>
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteListDialog({ 
                                open: true, 
                                listId: l.id, 
                                listName: l.nombre ?? l.Nombre ?? l.name 
                              })
                            }}
                          >
                            🗑️ Eliminar lista
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No tienes listas creadas todavía</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Las listas te permiten organizar y guardar tus películas favoritas. 
                  ¡Crea tu primera lista para empezar!
                </p>
                <Button onClick={() => setCreateListOpen(true)} className="bg-primary hover:bg-primary/90">
                  Crear mi primera lista
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Create List Dialog */}
      <Dialog open={createListOpen} onOpenChange={setCreateListOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Crear Nueva Lista</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input 
              value={newListNameProfile} 
              placeholder="Nombre de la lista" 
              onChange={(e) => setNewListNameProfile(e.target.value)} 
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagen de la lista</label>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById('list-file-input')?.click()}
                >
                  📁 Seleccionar imagen
                </Button>
                <span className="text-sm text-muted-foreground">
                  {newListImageFile ? newListImageFile.name : "Ningún archivo seleccionado"}
                </span>
              </div>
              <input 
                id="list-file-input"
                type="file" 
                accept="image/*" 
                onChange={(e) => setNewListImageFile(e.target.files?.[0] || null)} 
                className="hidden" 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCreateListOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateList}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation Dialog */}
      <AlertDialog open={deleteListDialog.open} onOpenChange={(open) => setDeleteListDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lista?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la lista "{deleteListDialog.listName}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteListDialog({ open: false, listId: null, listName: "" })}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteListDialog.listId && handleDeleteList(deleteListDialog.listId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
