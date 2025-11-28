"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { userService, User } from "@/lib/api/services/user.service"
import { useEffect, useState } from "react"
import { listService } from "@/lib/api/services/list.service"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CommentCard } from "@/components/comment-card"
import type { CommentCardProps } from "@/components/comment-card"
import { commentLikeService } from "@/lib/api/services/commentLike.service"
import { Trash2, Upload, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDialog } from "@/components/error-dialog"
import { SuccessDialog } from "@/components/success-dialog"

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [originalProfileData, setOriginalProfileData] = useState<any>(null) // Datos originales para comparar
  const [editOpen, setEditOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", message: "" })
  const [successDialog, setSuccessDialog] = useState({ open: false, title: "", message: "" })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [form, setForm] = useState({ username: "", fullName: "", email: "", bio: "", avatar: "" })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [userComments, setUserComments] = useState<CommentWithMovie[]>([])
  const [likedComments, setLikedComments] = useState<CommentWithMovie[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingLikedComments, setLoadingLikedComments] = useState(false)
  const [commentsTab, setCommentsTab] = useState<'mis-comentarios' | 'me-gustaron'>('mis-comentarios')
  const { toast } = useToast()
  const router = useRouter()

  // Función para validar si el username ya existe
  const validateUsername = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameError(null)
      return true
    }

    setCheckingUsername(true)
    try {
      console.log('Validando username:', username)
      console.log('Username actual del perfil:', profile?.username)
      
      const response = await userService.getAll()
      console.log('Respuesta completa del servidor:', response)
      
      let users: any[] = []
      
      // Manejar la estructura específica: response.data contiene el ApiResponse
      const apiResponse = (response.data || response) as any
      console.log('ApiResponse extraído:', apiResponse)
      
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        // Estructura: { success: true, data: [usuarios...] }
        users = apiResponse.data
      } else if (Array.isArray(apiResponse)) {
        // Estructura directa: [usuarios...]
        users = apiResponse
      } else if (Array.isArray(response)) {
        // Estructura directa en response
        users = response
      }

      console.log('Usuarios extraídos:', users)
      console.log('¿Es array?', Array.isArray(users))
      console.log('Cantidad de usuarios:', users.length)

      if (!Array.isArray(users) || users.length === 0) {
        console.warn('No se encontraron usuarios o respuesta inválida:', response)
        setUsernameError("Error al validar nombre de usuario")
        return false
      }
      
      const userExists = users.some((user: any) => {
        const userUsername = user.username || user.userName || user.user || user.name
        console.log('Comparando:', userUsername, 'con', username)
        const exists = userUsername && userUsername.toLowerCase() === username.toLowerCase()
        if (exists) console.log('¡COINCIDENCIA ENCONTRADA!')
        return exists
      })
      
      console.log('¿Username existe?', userExists)
      
      if (userExists) {
        setUsernameError("Este nombre de usuario ya está en uso")
        return false
      } else {
        setUsernameError(null)
        return true
      }
    } catch (error) {
      console.error("Error validando username:", error)
      setUsernameError("Error al validar nombre de usuario")
      return false
    } finally {
      setCheckingUsername(false)
    }
  }

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

          if (s.startsWith("data:image")) {
            return s
          }

          // 2. URL Google
          if (s.includes("imgres") || s.includes("imgurl=")) {
            const qIndex = s.indexOf("?")
            if (qIndex >= 0) {
              const qs = s.substring(qIndex + 1)
              const params = new URLSearchParams(qs)
              const img = params.get("imgurl")
              if (img) return decodeURIComponent(img)
            }
          }

          // 3. TMDB
          if (s.startsWith("/")) return `https://image.tmdb.org/t/p/w300${s}`

          // 4. URL normal
          if (s.startsWith("http://") || s.startsWith("https://")) return s

          return undefined
        } catch (e) {
          console.error("Error parsing avatar:", e)
          return undefined
        }
      })(),
      role: raw.role ?? (raw.boolAdmin ? "admin" : "user"),
      bio: raw.bio ?? raw.descripcion ?? raw.description ?? undefined,
      createdAt: raw.createdAt ?? raw.created_at ?? raw.fecha ?? new Date().toISOString(),
      followers: raw.followers ?? raw.seguidores ?? raw.numSeguidores ?? 0,
      following: raw.following ?? raw.seguidos ?? raw.numSeguidos ?? 0,
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

    const loadLists = async () => {
      setIsLogged(Boolean(typeof window !== "undefined" && localStorage.getItem("authToken")))
      try {
        let loaded: any[] = []
        if (localStorage.getItem("authToken")) {
          const profileData = JSON.parse(localStorage.getItem("fylt_user") || "{}")
          if (profileData.id) {
            console.log("Cargando listas para usuario:", profileData.id)
            const res = await listService.getByUserId(profileData.id)
            loaded = Array.isArray(res) ? res : []
            console.log("Listas obtenidas:", loaded.length)
          }
        }
        
        // Fallback a datos locales solo si no se pudo cargar del servidor
        if (!loaded || loaded.length === 0) {
          try {
            const stored = localStorage.getItem("fylt_user")
            if (stored) {
              const parsed = JSON.parse(stored)
              loaded = parsed.lists ?? parsed.listas ?? []
              if (loaded.length > 0) {
                console.log("Usando listas del almacenamiento local:", loaded.length)
              }
            }
          } catch (e) {
            console.warn("Error parseando datos locales:", e)
            loaded = []
          }
        }
        
        setLists(loaded || [])
      } catch (e) {
        console.error("Error cargando listas en profile:", e)
        // En caso de error, intentar cargar datos locales como fallback
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
        setShowLists(true)
      }
    }

    loadProfile()
    loadLists()
  }, [])

  // Cargar comentarios del usuario
  useEffect(() => {
    if (!profile?.id) return

    const loadUserComments = async () => {
      setLoadingComments(true)
      try {
        const allComments = await reviewService.getAll()
        // Filtrar comentarios del usuario actual
        const userCommentsList = allComments.filter((c) => String(c.idUser) === String(profile.id))
        // Ordenar por idPelicula
        const sorted = [...userCommentsList].sort((a, b) => a.idPelicula - b.idPelicula)
        // Tomar solo los primeros 5
        const topFive = sorted.slice(0, 5)

        // Obtener información de películas para cada comentario
        const commentsWithMovies = await Promise.all(
          topFive.map(async (comment) => {
            try {
              const movieRes = await movieService.getById(comment.idPelicula)
              const movie = movieRes?.data as Movie | undefined
              return {
                ...comment,
                movieImage: movie?.image || null,
              }
            } catch (err) {
              console.error(`Error cargando película ${comment.idPelicula}:`, err)
              return {
                ...comment,
                movieImage: null,
              }
            }
          })
        )

        setUserComments(commentsWithMovies)
      } catch (err) {
        console.error("Error cargando comentarios del usuario:", err)
      } finally {
        setLoadingComments(false)
      }
    }

    loadUserComments()
  }, [profile?.id])

  // Cargar comentarios que le gustaron al usuario
  useEffect(() => {
    if (!profile?.id) return

    const loadLikedComments = async () => {
      setLoadingLikedComments(true)
      try {
        // Usar el nuevo endpoint optimizado para obtener IDs de comentarios likeados
        const likedCommentsIds = await commentLikeService.getUserLikedComments(Number(profile.id))
        console.log('Comentarios likeados (IDs):', likedCommentsIds)
        
        if (!likedCommentsIds || likedCommentsIds.length === 0) {
          setLikedComments([])
          return
        }

        // Obtener todos los comentarios para conseguir la información completa
        const allComments = await reviewService.getAll()
        
        // Filtrar comentarios que coincidan con los IDs likeados
        const likedCommentsList = allComments.filter(comment => 
          likedCommentsIds.some((likedId: any) => {
            // El endpoint puede devolver objetos con id o solo IDs
            const commentId = typeof likedId === 'object' ? likedId.id : likedId
            return comment.id === commentId
          })
        )
        
        console.log('Comentarios likeados completos:', likedCommentsList)
        
        // Ordenar por ID descendente (más recientes primero) 
        const sorted = [...likedCommentsList].sort((a, b) => b.id - a.id)
        // Tomar solo los primeros 5
        const topFive = sorted.slice(0, 5)

        // Obtener información de películas para cada comentario
        const commentsWithMovies = await Promise.all(
          topFive.map(async (comment) => {
            try {
              const movieRes = await movieService.getById(comment.idPelicula)
              const movie = movieRes?.data as Movie | undefined
              return {
                ...comment,
                movieImage: movie?.image || null,
              }
            } catch (err) {
              console.error(`Error cargando película ${comment.idPelicula}:`, err)
              return {
                ...comment,
                movieImage: null,
              }
            }
          })
        )

        setLikedComments(commentsWithMovies)
      } catch (err) {
        console.error("Error cargando comentarios likeados:", err)
      } finally {
        setLoadingLikedComments(false)
      }
    }

    loadLikedComments()
  }, [profile?.id])

  // const mockLists = [
  //   { id: 1, name: "Favoritos", image: "/placeholder.svg?height=200&width=150" },
  //   { id: 2, name: "Lista 1", image: "/placeholder.svg?height=200&width=150" },
  // ]

  const [lists, setLists] = useState<any[]>([])
  const [listsLoaded, setListsLoaded] = useState(false)
  const [showLists, setShowLists] = useState(false)
  const [newListNameProfile, setNewListNameProfile] = useState("")
  const [newListImageFile, setNewListImageFile] = useState<File | null>(null)
  const [createListOpen, setCreateListOpen] = useState(false)
  const [isLogged, setIsLogged] = useState(false)
  
  // Estados para eliminar lista
  const [deleteListDialog, setDeleteListDialog] = useState({ open: false, listId: null as number | null, listName: "" })

  // Navegar a detalle de lista
  const handleListClick = (listaId: number) => {
    router.push(`/listas/${listaId}`)
  }

  // Función para manejar la carga de avatar
  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Verificar tamaño del archivo (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('La imagen debe ser menor a 5MB')
          return
        }
        
        // Verificar tipo de archivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor selecciona una imagen válida')
          return
        }
        
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setAvatarPreview(result)
          setForm(prev => ({ ...prev, avatar: result }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // Eliminar lista
  const handleDeleteList = async (listId: number) => {
    try {
      await listService.delete(listId)
      // Refrescar listas
      const refreshed = await listService.getByUserId(profile?.id || "0")
      setLists(Array.isArray(refreshed) ? refreshed : [])
      setDeleteListDialog({ open: false, listId: null, listName: "" })
    } catch (e) {
      console.error("Error eliminando lista:", e)
    }
  }

  type Comment = CommentCardProps & { id: number }
  const mockComments: Comment[] = [
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
                // Resetear estados de avatar
                setAvatarFile(null)
                setAvatarPreview(profile?.avatar ?? null)
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
            </div>
          )}
          {/* Estadísticas de seguimiento */}
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <div className="font-semibold text-lg">{profile?.followers ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{profile?.following ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Siguiendo</div>
                </div>
              </div>
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
              <Input 
                value={form.username} 
                onChange={async (e: any) => {
                  const newUsername = e.target.value
                  setForm((s) => ({ ...s, username: newUsername }))
                  if (newUsername !== profile?.username) {
                    await validateUsername(newUsername)
                  }
                }}
                placeholder="Username"
                className={usernameError ? "border-red-500" : ""}
              />
              {checkingUsername && (
                <p className="text-xs text-muted-foreground mt-1">Verificando disponibilidad...</p>
              )}
              {usernameError && (
                <p className="text-xs text-red-500 mt-1">{usernameError}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Email <span className="text-xs text-muted-foreground">(solo lectura)</span></label>
              <Input value={form.email} readOnly className="bg-muted/50" placeholder="Email" />
            </div>

            <div>
              <label className="text-sm font-medium">Avatar <span className="text-xs text-muted-foreground">(foto)</span></label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                    {(avatarPreview || form.avatar) ? (
                      <Image 
                        src={avatarPreview || form.avatar} 
                        alt="Preview avatar" 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAvatarUpload}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir foto
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setForm(s => ({ ...s, avatar: "" }))
                        setAvatarFile(null)
                        setAvatarPreview(null)
                      }}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar foto
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Tamaño máximo: 5MB. Formatos: JPG, PNG, WebP
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Biografía <span className="text-xs text-muted-foreground">(descripcion)</span></label>
              <Textarea value={form.bio} onChange={(e: any) => setForm((s) => ({ ...s, bio: e.target.value }))} placeholder="Biografía" />
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button variant="outline" onClick={() => {
                setEditOpen(false)
                setChangePasswordOpen(true)
              }}>Cambiar Contraseña</Button>
              <Button
                onClick={async () => {
                  if (!profile?.id) return;

                  // Validar username antes de guardar
                  if (form.username !== profile?.username) {
                    console.log('Iniciando validación antes de guardar...')
                    const isValid = await validateUsername(form.username)
                    console.log('Resultado de validación:', isValid)
                    if (!isValid || usernameError) {
                      console.log('Validación falló, mostrando error...')
                      setErrorDialog({
                        open: true,
                        title: "Username no válido",
                        message: usernameError || "El nombre de usuario ya está en uso"
                      })
                      return
                    }
                  }

                  // 1) Perfil con lo que el usuario ha puesto en formulario para carga rapida
                  const optimisticProfile: User = {
                    ...profile,
                    username: form.username,
                    fullName: form.fullName,
                    email: form.email,
                    bio: form.bio,
                    avatar: form.avatar || profile.avatar,
                    // mantenemos followers / following tal cual
                    followers: profile.followers,
                    following: profile.following,
                  };

                  // 2) Actualizamos con los datos nuevos
                  setProfile(optimisticProfile);

                  // 3) Construimos el payload para el backend
                  const payload = {
                    id: profile.id,
                    username: form.username,
                    email: form.email,
                    descripcion: form.bio,
                    foto: form.avatar,
                    realName: form.fullName,
                    // preservamos estos siempre

                    seguidores: profile.followers ?? 0,
                    seguidos: profile.following ?? 0,
                  };

                  try {
                    // 4) Mandamos el update al backend
                    await userService.update(profile.id, payload);

                    // 5) Actualizamos localStorage con los nuevos datos
                    try {
                      const stored = localStorage.getItem("fylt_user");
                      const prevRaw = stored ? JSON.parse(stored) : {};
                      const mergedRaw = { ...prevRaw, ...payload }; // mantiene forma backend + nuevos datos
                      localStorage.setItem("fylt_user", JSON.stringify(mergedRaw));
                    } catch (e) {
                      console.error("Error actualizando localStorage:", e);
                    }
                  } catch (err) {
                    console.error("Error actualizando perfil en backend:", err);
                  } finally {
                    setEditOpen(false);
                  }
                }}
              >
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo de cambiar contraseña */}
      <Dialog open={changePasswordOpen} onOpenChange={(o) => setChangePasswordOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Contraseña actual</label>
              <div className="relative">
                <Input 
                  type={showOldPassword ? "text" : "password"} 
                  value={passwordForm.oldPassword} 
                  onChange={(e) => setPasswordForm(s => ({ ...s, oldPassword: e.target.value }))}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nueva contraseña</label>
              <div className="relative">
                <Input 
                  type={showNewPassword ? "text" : "password"} 
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm(s => ({ ...s, newPassword: e.target.value }))}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar nueva contraseña</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm(s => ({ ...s, confirmPassword: e.target.value }))}
                  placeholder="Confirma tu nueva contraseña"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => {
                setChangePasswordOpen(false)
                setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
              }}>Cancelar</Button>
              <Button onClick={async () => {
                try {
                  // Validaciones
                  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                    setErrorDialog({
                      open: true,
                      title: "Campos incompletos",
                      message: "Todos los campos son obligatorios"
                    })
                    return
                  }
                  
                  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                    setErrorDialog({
                      open: true,
                      title: "Contraseñas no coinciden",
                      message: "Las contraseñas nuevas no coinciden"
                    })
                    return
                  }
                  
                  if (passwordForm.newPassword.length < 6) {
                    setErrorDialog({
                      open: true,
                      title: "Contraseña muy corta",
                      message: "La nueva contraseña debe tener al menos 6 caracteres"
                    })
                    return
                  }
                  
                  if (!profile?.id) {
                    setErrorDialog({
                      open: true,
                      title: "Error de usuario",
                      message: "ID de usuario no disponible"
                    })
                    return
                  }
                  
                  // Llamar al endpoint
                  const response = await userService.changePassword(
                    profile.id, 
                    passwordForm.oldPassword, 
                    passwordForm.newPassword
                  )
                  
                  // Saber la respuesta del back
                  const apiResponse = (response.data || response) as any
                  
                  if (apiResponse?.success === true && apiResponse?.statusCode === 200) {
                    setSuccessDialog({
                      open: true,
                      title: "Contraseña actualizada",
                      message: apiResponse?.message || "Contraseña actualizada correctamente"
                    })
                    setChangePasswordOpen(false)
                    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
                  } else {
                    // Manejar respuesta de error del backend (success: false)
                    const errorMsg = apiResponse?.message || "Error, la contraseña no es correcta"
                    setErrorDialog({
                      open: true,
                      title: "Error al cambiar contraseña",
                      message: errorMsg
                    })
                  }
                } catch (error: any) {
                  console.error("Error cambiando contraseña:", error)
                  
                  // Manejar errores HTTP específicos
                  let errorMsg = "Error al cambiar la contraseña"
                  let errorTitle = "Error"
                  
                  if (error?.response?.status === 400) {
                    // Error 400: El backend devuelve ApiResponseBase con success: false
                    const backendResponse = error?.response?.data
                    if (backendResponse?.message) {
                      errorMsg = backendResponse.message // "La contraseña actual es incorrecta"
                      errorTitle = "Contraseña incorrecta"
                    } else {
                      errorMsg = "Datos inválidos o contraseña actual incorrecta"
                    }
                  } else if (error?.response?.status === 404) {
                    errorMsg = "Usuario no encontrado"
                    errorTitle = "Usuario no encontrado"
                  } else if (error?.response?.status === 500) {
                    const backendResponse = error?.response?.data
                    errorMsg = backendResponse?.message || "Error interno del servidor"
                    errorTitle = "Error del servidor"
                  } else if (error?.message) {
                    errorMsg = error.message
                  }
                  
                  setErrorDialog({
                    open: true,
                    title: errorTitle,
                    message: errorMsg
                  })
                }
              }}>Guardar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  await listService.createWithUser(profile?.id || "0", { Nombre: newListNameProfile.trim(), Imagen: imageUrl })
                  const refreshed = await listService.getByUserId(profile?.id || "0")
                  setLists(Array.isArray(refreshed) ? refreshed : [])
                  setNewListNameProfile("")
                  setNewListImageFile(null)
                  setCreateListOpen(false)
                } catch (e) { console.error("Error:", e) }
              }}>Crear</Button>
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

      {/* Listas Section */}
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
                        <Image src={(l.imagen ?? l.image) || "/icon_lista_default.png"} alt={l.nombre ?? l.Nombre ?? l.name} fill className="object-cover" />
                      </div>
                      <p className="text-center font-medium text-sm md:text-base">{l.nombre ?? l.Nombre ?? l.name}</p>
                    </div>
                    
                    {/* Menú de opciones */}
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

      {/* Comentarios Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Comentarios</h2>
          <Button
            variant="link"
            className="text-primary"
            onClick={() => {
              // Navegar según el tab activo
              if (commentsTab === 'me-gustaron') {
                router.push("/profile/comentarios?tab=me-gustaron")
              } else {
                router.push("/profile/comentarios")
              }
            }}
          >
            VER MÁS →
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setCommentsTab('mis-comentarios')}
            className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
              commentsTab === 'mis-comentarios'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis comentarios
          </button>
          <button
            onClick={() => setCommentsTab('me-gustaron')}
            className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
              commentsTab === 'me-gustaron'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Me gustaron
          </button>
        </div>

        {/* Contenido según tab activo */}
        <div className="space-y-6">
          {commentsTab === 'mis-comentarios' ? (
            // Tab de mis comentarios
            loadingComments ? (
              <p className="text-center text-muted-foreground">Cargando comentarios...</p>
            ) : userComments.length === 0 ? (
              <p className="text-center text-muted-foreground">No has hecho comentarios todavía.</p>
            ) : (
              userComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  commentId={comment.id}
                  user={comment.username}
                  content={comment.descripcion}
                  likes={comment.numLikes ?? 0}
                  movieImage={comment.movieImage ?? comment.imagenPelicula ?? null}
                  movieId={comment.idPelicula}
                  showPoster={true}
                  userAvatar={comment.fotoPerfil}
                  userId={comment.idUser}
                  onCommentDeleted={async () => {
                    // Recargar comentarios después de eliminar
                    if (!profile?.id) return

                    setLoadingComments(true)
                    try {
                      const allComments = await reviewService.getAll()
                      const userCommentsList = allComments.filter((c) => String(c.idUser) === String(profile.id))
                      const sorted = [...userCommentsList].sort((a, b) => a.idPelicula - b.idPelicula)
                      const topTwo = sorted.slice(0, 2)

                      const commentsWithMovies = await Promise.all(
                        topTwo.map(async (comment) => {
                          try {
                            const movieRes = await movieService.getById(comment.idPelicula)
                            const movie = movieRes?.data as Movie | undefined
                            return {
                              ...comment,
                              movieImage: movie?.image || null,
                            }
                          } catch (err) {
                            console.error(`Error cargando película ${comment.idPelicula}:`, err)
                            return {
                              ...comment,
                              movieImage: null,
                            }
                          }
                        })
                      )

                      setUserComments(commentsWithMovies)
                    } catch (err) {
                      console.error("Error cargando comentarios del usuario:", err)
                    } finally {
                      setLoadingComments(false)
                    }
                  }}
                />
              ))
            )
          ) : (
            // Tab de comentarios que me gustaron
            loadingLikedComments ? (
              <p className="text-center text-muted-foreground">Cargando comentarios...</p>
            ) : likedComments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No has dado me gusta a ningún comentario todavía.</p>
                <p className="text-sm text-muted-foreground">Explora películas y da like a comentarios que te parezcan interesantes.</p>
              </div>
            ) : (
              likedComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  commentId={comment.id}
                  user={comment.username}
                  content={comment.descripcion}
                  likes={comment.numLikes ?? 0}
                  movieImage={comment.movieImage ?? comment.imagenPelicula ?? null}
                  movieId={comment.idPelicula}
                  showPoster={true}
                  userAvatar={comment.fotoPerfil}
                  userId={comment.idUser}
                  defaultLiked={true}
                  onLikeChange={(liked) => {
                    if (!liked) {
                      // Si se quita el like, eliminar de la lista
                      setLikedComments(prev => prev.filter(c => c.id !== comment.id))
                    }
                  }}
                />
              ))
            )
          )}
        </div>
      </section>

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}
        title={errorDialog.title}
        description={errorDialog.message}
      />
      
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialog.open}
        onOpenChange={(open) => setSuccessDialog(prev => ({ ...prev, open }))}
        title={successDialog.title}
        description={successDialog.message}
      />
    </div>
  )
}
