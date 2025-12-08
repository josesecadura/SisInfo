"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { movieService } from "@/lib/api/services/movie.service"
import { reviewService } from "@/lib/api/services/review.service"
import type { BackendComment } from "@/lib/api/services/review.service"
import { listService } from "@/lib/api/services/list.service"
import { CommentCardCompact } from "@/components/comment-card-compact"
import { useToast } from "@/components/toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { ActividadService } from "@/lib/api/services/actividad.service"

export default function MovieDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id

  const [movie, setMovie] = useState<any | null>(null)
  const [comments, setComments] = useState<BackendComment[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [newListName, setNewListName] = useState("")
  const [listsLoaded, setListsLoaded] = useState(false)
  const [showLists, setShowLists] = useState(false)
  
  // Estados para el diálogo de crear lista
  const [createListOpen, setCreateListOpen] = useState(false)
  const [newListNameProfile, setNewListNameProfile] = useState("")
  const [newListImageFile, setNewListImageFile] = useState<File | null>(null)
  
  // Estados para comentarios
  const [addCommentOpen, setAddCommentOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [commentsLoading, setCommentsLoading] = useState(true)
  
  const { showToast, ToastComponent } = useToast()
  const { user: currentUser, isLoggedIn } = useCurrentUser()

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const res = await movieService.getById(id)
        const anyRes: any = res
        const payload = anyRes?.data?.data ?? anyRes?.data ?? anyRes
        setMovie(payload)
      } catch (e) {
        console.error("Error cargando película:", e)
      }

      try {
        // Pasar el userId para obtener los likes correctos
        const userId = currentUser ? Number(currentUser.id) : undefined
        setCommentsLoading(true)
        const all = await reviewService.getAll(userId)
        const arr = Array.isArray(all) ? all.filter((c) => Number(c.idPelicula) === Number(id)) : []
        setComments(arr)
      } catch (e) {
        console.error("Error cargando comentarios:", e)
      } finally {
        setCommentsLoading(false)
      }

      // Do not auto-load lists here. Lists are loaded on demand when user clicks the "Añadir" flow.
    }

    load()
  }, [id])

  const addToList = async (list: any) => {
    try {
      // Primero verificar si la película ya está en la lista
      const movieAlreadyInList = await checkIfMovieInList(list.id, Number(id))
      if (movieAlreadyInList) {
        showToast(`La película "${movie?.titulo}" ya está en la lista "${list.name ?? list.Nombre ?? list.nombre}"`, "info")
        return
      }

      if (isLoggedIn && typeof list.id === "number") {
        try {
          await listService.addPelicula(list.id, Number(id))
          showToast(`Película "${movie?.titulo}" añadida exitosamente a "${list.name ?? list.Nombre ?? list.nombre}"`, "success")
          // refresh lists from backend to reflect change
          const user = JSON.parse(localStorage.getItem("fylt_user") || "{}")
          const refreshed = await listService.getByUserId(user.id || "1")
          setLists(Array.isArray(refreshed) ? refreshed : [])
        } catch (e) {
          console.error("Error añadiendo película a la lista en backend:", e)
          showToast("Error al añadir la película a la lista", "error")
        }
      } else {
        // Local storage logic (keep existing)
        const exists = list.items && Array.isArray(list.items) && list.items.includes(Number(id))
        if (!exists) {
          list.items = list.items || []
          list.items.push(Number(id))
          try {
            const stored = localStorage.getItem("fylt_user")
            if (stored) {
              const parsed = JSON.parse(stored)
              parsed.lists = parsed.lists ?? parsed.listas ?? []
              const idx = parsed.lists.findIndex((x: any) => x.id === list.id)
              if (idx >= 0) parsed.lists[idx] = list
              else parsed.lists.push(list)
              localStorage.setItem("fylt_user", JSON.stringify(parsed))
            } else {
              const raw = localStorage.getItem("fylt_lists")
              const arr = raw ? JSON.parse(raw) : []
              const idx = arr.findIndex((x: any) => x.id === list.id)
              if (idx >= 0) arr[idx] = list
              else arr.push(list)
              localStorage.setItem("fylt_lists", JSON.stringify(arr))
            }
          } catch (e) {
            console.error("Error persistiendo lista:", e)
          }
          setLists((prev) => prev.map((x) => (x.id === list.id ? { ...list } : x)))
        }
      }
    } catch (e) {
      console.error("Error al añadir a la lista", e)
    }
  }

  // Nueva función para verificar si la película ya está en la lista
  const checkIfMovieInList = async (listaId: any, peliculaId: number) => {
    try {
      const movies = await listService.getPeliculasByLista(listaId)
      return Array.isArray(movies) && movies.some((movie: any) => Number(movie.id) === peliculaId)
    } catch (e) {
      console.error("Error verificando película en lista:", e)
      return false
    }
  }

  // Load lists on demand when user requests the "añadir a mis listas" panel
  const loadListsOnDemand = async () => {
    if (listsLoaded) return
    try {
      let loaded: any[] = []
      if (isLoggedIn) {
        try {
          const user = JSON.parse(localStorage.getItem("fylt_user") || "{}")
          const res = await listService.getByUserId(user.id || "1")
          loaded = Array.isArray(res) ? res : []
        } catch (e) {
          console.error("Error cargando listas desde backend:", e)
          loaded = []
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
          loaded = []
        }
      }
      if ((!loaded || loaded.length === 0) && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("fylt_lists")
          if (raw) loaded = JSON.parse(raw)
        } catch (e) {
          // Empty catch block
        }
      }

      setLists(loaded || [])
    } catch (e) {
      setLists([])
    } finally {
      setListsLoaded(true)
    }
  }

  const createList = () => {
    if (!newListName.trim()) return
    const name = newListName.trim()
    if (isLoggedIn) {
      ;(async () => {
        try {
          const res = await listService.create({ Nombre: name })
          const anyRes: any = res
          const createdId = anyRes?.data?.data ?? anyRes?.data ?? anyRes
          // If creation returned an id, add pelicula to it
          if (createdId) {
            try {
              await listService.addPelicula(createdId, Number(id))
            } catch (e) {
              console.error("Error añadiendo película a la nueva lista en backend:", e)
            }
          }
          // refresh lists
          const user = JSON.parse(localStorage.getItem("fylt_user") || "{}")
          const refreshed = await listService.getByUserId(user.id || "1")
          setLists(Array.isArray(refreshed) ? refreshed : [])
          setNewListName("")
        } catch (e) {
          console.error("Error creando lista en backend:", e)
        }
      })()
    } else {
      const nl = { id: `list_${Date.now()}`, name, items: [Number(id)] }
      try {
        const raw = localStorage.getItem("fylt_lists")
        const arr = raw ? JSON.parse(raw) : []
        arr.push(nl)
        localStorage.setItem("fylt_lists", JSON.stringify(arr))
        setLists((prev) => [...prev, nl])
        setNewListName("")
      } catch (e) {
        console.error("Error creando lista:", e)
      }
    }
  }

  // Crear comentario
  const handleCreateComment = async () => {
    if (!newComment.trim() || !isLoggedIn || !currentUser) return
    
    try {
      const commentData = {
        idUser: Number(currentUser.id),
        idPelicula: Number(id),
        descripcion: newComment.trim(),
        username: currentUser.username || "usuario",
        imagenPelicula: movie?.imagen || "",
        numLikes: 0,
        visible: false, // Los comentarios requieren aprobación
        aprobado: null
      }
      
      await reviewService.create(commentData)
      
      // Registrar actividad de comentario publicado
      await ActividadService.registrarActividad({
        tipoActividad: "COMENTARIO_PUBLICADO",
        idUsuario: Number(currentUser.id),
        detalles: `Comentario publicado en película: ${movie?.titulo || id}`
      })
      
      // Recargar comentarios
      const userId = currentUser ? Number(currentUser.id) : undefined
      const updatedComments = await reviewService.getAll(userId)
      const filtered = Array.isArray(updatedComments) ? updatedComments.filter((c) => Number(c.idPelicula) === Number(id)) : []
      setComments(filtered)
      
      setNewComment("")
      setAddCommentOpen(false)
      showToast("Comentario añadido exitosamente", "success")
    } catch (e) {
      console.error("Error creando comentario:", e)
      showToast("Error al crear el comentario", "error")
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="flex items-start gap-8">
        <div className="w-48 md:w-72 lg:w-96 rounded overflow-hidden bg-muted">
          {movie?.imagen ? (
            <Image src={movie.imagen} alt={movie.titulo || "Poster"} width={600} height={900} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-muted-foreground/20" style={{ height: 400 }} />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{movie?.titulo ?? "Película"}</h1>
          <div className="text-sm text-muted-foreground mb-4">{movie?.fecha ? new Date(movie.fecha).toLocaleDateString() : "Fecha desconocida"} · Valoración: {movie?.valoracion ? `${movie.valoracion}/10` : 'N/A'}</div>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">{movie?.descripcion ?? "Sinopsis no disponible."}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Géneros</h3>
            <div className="flex gap-2 flex-wrap">
              {(movie?.generos ?? []).map((g: any) => (
                <span key={g} className="px-3 py-1 bg-primary/10 rounded-md text-sm">{g}</span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Añadir a mis listas</h3>
            {isLoggedIn ? (
              <div>
                {!showLists ? (
                  <div>
                    <Button onClick={async () => { setShowLists(true); await loadListsOnDemand() }}>Añadir a mis listas</Button>
                    <div className="text-xs text-muted-foreground mt-2">Pulsa para cargar tus listas y elegir dónde añadir esta película.</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {lists && lists.length > 0 ? (
                      <div>
                        {lists.map((l) => (
                          <div key={l.id} className="flex items-center justify-between mb-2">
                            <div className="text-sm">{l.name ?? l.Nombre ?? l.NombreLista ?? l.nombre}</div>
                            <Button size="sm" onClick={() => addToList(l)}>Añadir</Button>
                          </div>
                        ))}
                        <div className="mt-3 pt-2 border-t">
                          <Button variant="outline" onClick={() => setCreateListOpen(true)}>Crear nueva lista</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">No tienes listas todavía.</div>
                        <div className="flex items-center gap-2">
                          <Input value={newListName} placeholder="Nombre nueva lista" onChange={(e:any) => setNewListName(e.target.value)} />
                          <Button onClick={createList}>Crear y añadir</Button>
                        </div>
                        <div className="mt-2">
                          <Button variant="outline" onClick={() => setCreateListOpen(true)}>Crear nueva lista</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Inicia sesión para guardar en tus listas.</div>
            )}
          </div>

          <div>
            <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Comentarios</h2>
          {isLoggedIn && (
            <Button onClick={() => setAddCommentOpen(true)}>
              💬 Añadir comentario
            </Button>
          )}
        </div>
        {commentsLoading ? (
          <div className="text-sm text-muted-foreground">Cargando comentarios...</div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((c) => (
              <CommentCardCompact
                key={c.id}
                commentId={c.id}
                user={c.username}
                content={c.descripcion || ""}
                likes={typeof c.numLikes === "number" ? c.numLikes : 0}
                userId={c.idUser}
                onCommentDeleted={() => {
                  // Eliminar comentario de la lista local
                  setComments(prev => prev.filter(comment => comment.id !== c.id))
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hay comentarios todavía.</div>
        )}
        
        {!isLoggedIn && (
          <div className="text-center mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Inicia sesión para añadir comentarios</p>
          </div>
        )}
      </section>

      {/* Create List Dialog */}
      <Dialog open={createListOpen} onOpenChange={setCreateListOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Crear Nueva Lista</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={newListNameProfile} placeholder="Nombre de la lista" onChange={(e) => setNewListNameProfile(e.target.value)} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagen de la lista</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => document.getElementById('list-file-input')?.click()}>
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
              <Button onClick={async () => {
                if (!newListNameProfile.trim()) return
                const imageUrl = newListImageFile ? URL.createObjectURL(newListImageFile) : "/icon_lista_default.png"
                try {
                  const userData = JSON.parse(localStorage.getItem("fylt_user") || "{}")
                  await listService.createWithUser(userData.id || "0", { Nombre: newListNameProfile.trim(), Imagen: imageUrl })
                  const refreshed = await listService.getByUserId(userData.id || "0")
                  setLists(Array.isArray(refreshed) ? refreshed : [])
                  setNewListNameProfile("")
                  setNewListImageFile(null)
                  setCreateListOpen(false)
                  showToast(`Lista "${newListNameProfile.trim()}" creada exitosamente`, "success")
                } catch (e) { 
                  console.error("Error:", e)
                  showToast("Error al crear la lista", "error")
                }
              }}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Comment Dialog */}
      <Dialog open={addCommentOpen} onOpenChange={setAddCommentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Añadir Comentario</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Tu comentario sobre "{movie?.titulo}"</label>
              <Textarea 
                value={newComment}
                placeholder="Escribe tu opinión sobre esta película..."
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-2 min-h-[100px]"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground mt-1">{newComment.length}/500 caracteres</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => {
                setAddCommentOpen(false)
                setNewComment("")
              }}>Cancelar</Button>
              <Button 
                onClick={handleCreateComment}
                disabled={!newComment.trim()}
              >
                Publicar comentario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ToastComponent />
    </div>
  )
}
