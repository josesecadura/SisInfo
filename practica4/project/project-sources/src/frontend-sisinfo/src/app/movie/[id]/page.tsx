"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { movieService } from "@/lib/api/services/movie.service"
import { reviewService } from "@/lib/api/services/review.service"
import { listService } from "@/lib/api/services/list.service"

export default function MovieDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id

  const [movie, setMovie] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [newListName, setNewListName] = useState("")
  const [listsLoaded, setListsLoaded] = useState(false)
  const [showLists, setShowLists] = useState(false)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    const logged = Boolean(typeof window !== "undefined" && localStorage.getItem("authToken"))
    setIsLogged(logged)

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
        const all = await reviewService.getAll()
        const arr = Array.isArray(all) ? all.filter((c) => Number(c.idPelicula) === Number(id)) : []
        setComments(arr)
      } catch (e) {
        console.error("Error cargando comentarios:", e)
      }

      // Do not auto-load lists here. Lists are loaded on demand when user clicks the "Añadir" flow.
    }

    load()
  }, [id])

  const addToList = (list: any) => {
    try {
      const exists = list.items && Array.isArray(list.items) && list.items.includes(Number(id))
      if (!exists) {
        list.items = list.items || []
        list.items.push(Number(id))
        // persist: if logged in, call backend endpoints; otherwise use localStorage
        if (isLogged && typeof list.id === "number") {
          ;(async () => {
            try {
              await listService.addPelicula(list.id, Number(id))
              // refresh lists from backend to reflect change
              const refreshed = await listService.getAll()
              setLists(Array.isArray(refreshed) ? refreshed : [])
            } catch (e) {
              console.error("Error añadiendo película a la lista en backend:", e)
            }
          })()
        } else {
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

  // Load lists on demand when user requests the "añadir a mis listas" panel
  const loadListsOnDemand = async () => {
    if (listsLoaded) return
    try {
      let loaded: any[] = []
      if (isLogged) {
        try {
          const res = await listService.getAll()
          loaded = Array.isArray(res) ? res : []
        } catch (e) {
          console.error("Error cargando listas desde backend:", e)
          loaded = []
        }
      }

      // fallback to localStorage if none
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
          // ignore
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
    if (isLogged) {
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
          const refreshed = await listService.getAll()
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
          <div className="text-sm text-muted-foreground mb-4">{movie?.fecha ? new Date(movie.fecha).toLocaleDateString() : "Fecha desconocida"} · Valoración: {movie?.valoracion ?? 'N/A'}</div>
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
            {isLogged ? (
              <div>
                {!showLists ? (
                  <div>
                    <Button onClick={async () => { setShowLists(true); await loadListsOnDemand() }}>Añadir a mis listas</Button>
                    <div className="text-xs text-muted-foreground mt-2">Pulsa para cargar tus listas y elegir dónde añadir esta película.</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {lists && lists.length > 0 ? lists.map((l) => (
                      <div key={l.id} className="flex items-center justify-between">
                        <div className="text-sm">{l.name ?? l.Nombre ?? l.NombreLista ?? l.nombre}</div>
                        <Button size="sm" onClick={() => addToList(l)}>Añadir</Button>
                      </div>
                    )) : (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">No tienes listas todavía.</div>
                        <div className="flex items-center gap-2">
                          <Input value={newListName} placeholder="Nombre nueva lista" onChange={(e:any) => setNewListName(e.target.value)} />
                          <Button onClick={createList}>Crear y añadir</Button>
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
        <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="p-4 rounded-lg bg-card border border-border">
                <div className="text-xs text-muted-foreground mb-2">Usuario: {c.idUser}</div>
                <div className="text-sm">{c.descripcion}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hay comentarios todavía.</div>
        )}
      </section>
    </div>
  )
}
