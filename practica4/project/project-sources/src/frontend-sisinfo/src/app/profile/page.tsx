"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Image from "next/image"
import { userService, User } from "@/lib/api/services/user.service"
import { useEffect, useState } from "react"
import { listService } from "@/lib/api/services/list.service"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ username: "", fullName: "", email: "", bio: "", avatar: "" })

  const mapToProfile = (raw: any): User => {
    if (!raw) return {
      id: "0",
      username: "unknown",
      email: "",
      fullName: "",
      role: "user",
      createdAt: new Date().toISOString(),
    }

    return {
      id: raw.id != null ? String(raw.id) : raw.Id != null ? String(raw.Id) : raw.userId ?? "0",
      username: raw.username ?? raw.userName ?? raw.user ?? raw.Nombre ?? raw.realName ?? raw.name ?? "user",
      email: raw.email ?? raw.correo ?? "",
      fullName: raw.fullName ?? raw.realName ?? raw.real_name ?? "",
      avatar: (() => {
        const rawAvatar = raw.avatar ?? raw.foto ?? raw.photo ?? raw.profile_path ?? raw.image ?? undefined
        if (!rawAvatar) return undefined
        try {
          const s = String(rawAvatar)
          // Caso: URL de Google search result que contiene imgurl=
          if (s.includes("imgres") || s.includes("imgurl=")) {
            const qIndex = s.indexOf("?")
            if (qIndex >= 0) {
              const qs = s.substring(qIndex + 1)
              const params = new URLSearchParams(qs)
              const img = params.get("imgurl")
              if (img) return decodeURIComponent(img)
            }
          }
          // Si es una ruta de TMDB (profile_path) sin host
          if (s.startsWith("/")) return `https://image.tmdb.org/t/p/w300${s}`
          // Si es ya una URL válida
          if (s.startsWith("http://") || s.startsWith("https://")) return s
          return undefined
        } catch (e) {
          return undefined
        }
      })(),
      role: raw.role ?? (raw.boolAdmin ? "admin" : "user"),
      bio: raw.bio ?? raw.descripcion ?? raw.description ?? undefined,
      createdAt: raw.createdAt ?? raw.created_at ?? raw.fecha ?? new Date().toISOString(),
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Preferir los datos almacenados en localStorage por el login
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("fylt_user")
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              // If stored data lacks bio/avatar, try to enrich from users list
              const needsBio = !parsed.descripcion && !parsed.bio && !parsed.foto && !parsed.avatar
              if (needsBio) {
                try {
                  const usersRes = await userService.getAll()
                  const anyUsers = usersRes as any
                  const list = anyUsers?.data?.data ?? anyUsers?.data ?? anyUsers
                  if (Array.isArray(list) && list.length > 0) {
                    const found = list.find((u: any) => {
                      return (
                        (parsed.username && (u.username === parsed.username || u.userName === parsed.username)) ||
                        (parsed.email && u.email === parsed.email)
                      )
                    })
                    if (found) {
                      const merged = { ...parsed, ...found }
                      setProfile(mapToProfile(merged))
                      return
                    }
                  }
                } catch (e) {
                  // ignore enrichment error and fall back to stored
                }
              }

              setProfile(mapToProfile(parsed))
              return
            } catch (e) {
              // fallthrough a la petición
            }
          }
        }

        // Intentar endpoint estándar (userService.getProfile)
        const res = await userService.getProfile()
        const anyRes = res as any
        const payload = anyRes?.data?.data ?? anyRes?.data ?? anyRes
        if (payload) {
          setProfile(mapToProfile(payload))
          return
        }

        // Fallback: consultar lista de Usuarios (ruta conocida en backend)
        try {
          const usersRes = await userService.getAll()
          const anyUsers = usersRes as any
          const list = anyUsers?.data?.data ?? anyUsers?.data ?? anyUsers
          if (Array.isArray(list) && list.length > 0) {
            const u = list[0]
            setProfile(mapToProfile(u))
          }
        } catch (e) {
          // ignore final fallback error
        }
      } catch (err) {
        console.error("Error cargando perfil:", err)
      }
    }

    loadProfile()
  }, [])

  const mockLists = [
    { id: 1, name: "Favoritos", image: "/placeholder.svg?height=200&width=150" },
    { id: 2, name: "Lista 1", image: "/placeholder.svg?height=200&width=150" },
    { id: 3, name: "Lista 2", image: "/placeholder.svg?height=200&width=150" },
    { id: 4, name: "Lista 3", image: "/placeholder.svg?height=200&width=150" },
  ]

  const [lists, setLists] = useState<any[]>([])
  const [listsLoaded, setListsLoaded] = useState(false)
  const [showLists, setShowLists] = useState(false)
  const [newListNameProfile, setNewListNameProfile] = useState("")
  const [isLogged, setIsLogged] = useState(false)

  const mockComments = [
    {
      id: 1,
      user: "Usuario_777",
      content:
        "Esta película me parece terrible, no se como dejaron poner esto en los cines. Sinceramente es una de las pocas películas donde he llegado a dormirme en el cine. Los niños lloraban desconsoladamente en la parte donde explotan los coches. No la recomiendo",
      likes: 140,
      movieImage: "/placeholder.svg?height=150&width=100",
    },
    {
      id: 2,
      user: "Usuario_777",
      content:
        "Esta película me parece terrible, no se como dejaron poner esto en los cines. Sinceramente es una de las pocas películas donde he llegado a dormirme en el cine. Los niños lloraban desconsoladamente en la parte donde explotan los coches. No la recomiendo",
      likes: 2,
      movieImage: "/placeholder.svg?height=150&width=100",
    },
  ]

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted shrink-0">
          <div className="w-full h-full flex items-center justify-center">
            {profile?.avatar ? (
              <Image src={profile.avatar} alt={profile.username || profile.fullName || "Avatar"} fill className="object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted-foreground/20" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold">{profile?.fullName ?? profile?.username ?? "Usuario_777"}</div>
              <div className="text-sm text-muted-foreground">@{profile?.username ?? "usuario"}</div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              onClick={() => {
                // open editor prefilled with profile or defaults
                setForm({
                  username: profile?.username ?? "",
                  fullName: profile?.fullName ?? "",
                  email: profile?.email ?? "",
                  bio: profile?.bio ?? "",
                  avatar: profile?.avatar ?? "",
                })
                setEditOpen(true)
              }}
            >
              Editar perfil
            </Button>
          </div>
          <p className="text-muted-foreground leading-relaxed">{profile?.bio ?? ""}</p>
          {profile && (
            <div className="mt-3 text-sm text-muted-foreground">
              <div>Email: {profile.email}</div>
              <div>Rol: {profile.role}</div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => setEditOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Nombre completo <span className="text-xs text-muted-foreground">(realName)</span></label>
              <Input value={form.fullName} onChange={(e: any) => setForm((s) => ({ ...s, fullName: e.target.value }))} placeholder="Nombre completo" />
            </div>

            <div>
              <label className="text-sm font-medium">Username <span className="text-xs text-muted-foreground">(username)</span></label>
              <Input value={form.username} onChange={(e: any) => setForm((s) => ({ ...s, username: e.target.value }))} placeholder="Username" />
            </div>

            <div>
              <label className="text-sm font-medium">Email <span className="text-xs text-muted-foreground">(email)</span></label>
              <Input value={form.email} onChange={(e: any) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" />
            </div>

            <div>
              <label className="text-sm font-medium">Avatar <span className="text-xs text-muted-foreground">(foto / URL)</span></label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                  {form.avatar ? (
                    // preview de 64x64
                    <Image src={form.avatar} alt="Preview avatar" width={64} height={64} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted-foreground/20" />
                  )}
                </div>
                <Input value={form.avatar} onChange={(e: any) => setForm((s) => ({ ...s, avatar: e.target.value }))} placeholder="URL avatar" />
                <Button variant="ghost" onClick={() => setForm((s) => ({ ...s, avatar: "" }))}>Limpiar</Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Pega una URL pública (https://...) para usar como avatar.</div>
            </div>

            <div>
              <label className="text-sm font-medium">Biografía <span className="text-xs text-muted-foreground">(descripcion)</span></label>
              <Textarea value={form.bio} onChange={(e: any) => setForm((s) => ({ ...s, bio: e.target.value }))} placeholder="Biografía" />
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button
                onClick={async () => {
                  try {
                    // prepare payload mapping to backend fields
                    const payload: any = {
                      username: form.username,
                      email: form.email,
                      descripcion: form.bio,
                      foto: form.avatar,
                      realName: form.fullName,
                    }

                    if (profile?.id) {
                      const res = await userService.update(profile.id, payload)
                      const anyRes = res as any
                      const updated = anyRes?.data?.data ?? anyRes?.data ?? anyRes
                      if (updated) {
                        const mapped = mapToProfile(updated)
                        setProfile(mapped)
                        try {
                          localStorage.setItem("fylt_user", JSON.stringify(updated))
                        } catch (e) {}
                      } else {
                        // fallback: update local state
                        setProfile(mapToProfile({ ...profile, ...payload }))
                      }
                    } else {
                      setProfile(mapToProfile({ ...profile, ...payload }))
                    }
                  } catch (err) {
                    console.error("Error updating profile:", err)
                    setProfile(mapToProfile({ ...profile, username: form.username, email: form.email, descripcion: form.bio, foto: form.avatar, realName: form.fullName }))
                  } finally {
                    setEditOpen(false)
                  }
                }}
              >Guardar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Listas Section (lazy load) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Listas</h2>
          {!showLists ? (
            <Button variant="link" className="text-primary" onClick={async () => {
              setShowLists(true)
              setIsLogged(Boolean(typeof window !== "undefined" && localStorage.getItem("authToken")))
              if (!listsLoaded) {
                try {
                  let loaded: any[] = []
                  if (localStorage.getItem("authToken")) {
                    const res = await listService.getAll()
                    loaded = Array.isArray(res) ? res : []
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
                  setLists(loaded || [])
                } catch (e) {
                  console.error("Error cargando listas en profile:", e)
                  setLists([])
                } finally {
                  setListsLoaded(true)
                }
              }
            }}>
              VER MIS LISTAS →
            </Button>
          ) : (
            <Button variant="link" className="text-primary" onClick={() => { setShowLists(false) }}>OCULTAR</Button>
          )}
        </div>

        {!showLists ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mockLists.map((list) => (
              <div key={list.id} className="group cursor-pointer">
                <div className="relative aspect-2/3 rounded-lg overflow-hidden border-2 border-primary/50 bg-muted mb-3 transition-all group-hover:border-primary group-hover:scale-105">
                  <Image src={list.image || "/placeholder.svg"} alt={list.name} fill className="object-cover" />
                </div>
                <p className="text-center font-medium text-sm md:text-base">{list.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {lists && lists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {lists.map((l: any) => (
                  <div key={l.id} className="group cursor-pointer">
                    <div className="relative aspect-2/3 rounded-lg overflow-hidden border-2 border-primary/50 bg-muted mb-3 transition-all group-hover:border-primary group-hover:scale-105">
                      <Image src={(l.imagen ?? l.image) || "/placeholder.svg"} alt={l.nombre ?? l.Nombre ?? l.name} fill className="object-cover" />
                    </div>
                    <p className="text-center font-medium text-sm md:text-base">{l.nombre ?? l.Nombre ?? l.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">No tienes listas todavía.</div>
                <div className="flex items-center gap-2">
                  <Input value={newListNameProfile} placeholder="Nombre nueva lista" onChange={(e:any) => setNewListNameProfile(e.target.value)} />
                  <Button onClick={async () => {
                    if (!newListNameProfile.trim()) return
                    const name = newListNameProfile.trim()
                    if (isLogged) {
                      try {
                        const res = await listService.create({ Nombre: name })
                        const anyRes: any = res
                        const createdId = anyRes?.data?.data ?? anyRes?.data ?? anyRes
                        // refresh
                        const refreshed = await listService.getAll()
                        setLists(Array.isArray(refreshed) ? refreshed : [])
                        setNewListNameProfile("")
                      } catch (e) {
                        console.error("Error creando lista en backend:", e)
                      }
                    } else {
                      // local fallback
                      try {
                        const nl = { id: `list_${Date.now()}`, name, items: [] }
                        const raw = localStorage.getItem("fylt_lists")
                        const arr = raw ? JSON.parse(raw) : []
                        arr.push(nl)
                        localStorage.setItem("fylt_lists", JSON.stringify(arr))
                        setLists((prev) => [...prev, nl])
                        setNewListNameProfile("")
                      } catch (e) {
                        console.error("Error creando lista local:", e)
                      }
                    }
                  }}>Crear</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Comentarios Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Comentarios</h2>
          <Button variant="link" className="text-primary">
            VER MÁS →
          </Button>
        </div>
        <div className="space-y-6">
          {mockComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-xl border-2 border-primary/30 bg-card">
              <div className="relative w-20 md:w-24 h-28 md:h-36 shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={comment.movieImage || "/placeholder.svg"}
                  alt="Movie poster"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                  <span className="font-bold truncate">{comment.user}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{comment.content}</p>
                <div className="flex items-center gap-2 text-red-500">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-bold">{comment.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
