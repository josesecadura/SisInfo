"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CommentCard } from "@/components/comment-card"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useFriends } from "@/hooks/use-friends"
import { userService, User } from "@/lib/api/services/user.service"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"
import Image from "next/image"

interface UserProfile {
  id: number
  username: string
  email?: string
  fullName?: string
  fotoPerfil?: string | null
  descripcion?: string
  seguidores?: number
  seguidos?: number
}

interface BackendUserResponse {
  success: boolean
  statusCode: number
  message: string
  data: User
}

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
}

export default function ProfileDynamicPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userComments, setUserComments] = useState<CommentWithMovie[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(false)
  
  const router = useRouter()
  const { user: currentUser, isLoggedIn } = useCurrentUser()
  const { friends, followUser, unfollowUser } = useFriends()
  
  const profileId = parseInt(resolvedParams.id)
  const isOwnProfile = currentUser && Number(currentUser.id) === profileId

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        
        // Cargar información del usuario específico usando getById
        const userResponse = await userService.getById(profileId)
        console.log("User response:", userResponse)
        console.log("User response data:", userResponse?.data)
        
        // Manejar la estructura de respuesta del backend (doble anidamiento)
        if (userResponse && userResponse.success && userResponse.data) {
          // El backend devuelve {success: true, data: {...}}, pero nuestro cliente ya envuelve en {data: {...}}
          // Entonces tenemos: userResponse.data = {success: true, data: {userData}}
          const backendResponse = userResponse.data as any
          console.log("Backend response:", backendResponse)
          
          if (backendResponse.success && backendResponse.data) {
            const userData = backendResponse.data
            console.log("Processing userData:", userData)
            console.log("All userData keys:", Object.keys(userData))
            console.log("userData.realName:", userData.realName)
            console.log("userData.descripcion:", userData.descripcion)
            console.log("userData.seguidores:", userData.seguidores)
            console.log("userData.seguidos:", userData.seguidos)
            console.log("userData.id:", userData.id)
            console.log("userData.username:", userData.username)
            console.log("userData.foto:", userData.foto)
            console.log("userData.fotoPerfil:", userData.fotoPerfil)
            console.log("userData.avatar:", userData.avatar)
            console.log("userData.image:", userData.image)
            
            // Función para parsear URLs de imagen (especialmente de Google)
            const parseImageUrl = (rawUrl: string | null | undefined): string | null => {
              if (!rawUrl) return null
              
              try {
                const s = String(rawUrl)
                console.log("Parsing image URL:", s)
                
                // Caso: URL de Google search result que contiene imgurl=
                if (s.includes("imgres") || s.includes("imgurl=")) {
                  const qIndex = s.indexOf("?")
                  if (qIndex >= 0) {
                    const qs = s.substring(qIndex + 1)
                    const params = new URLSearchParams(qs)
                    const img = params.get("imgurl")
                    if (img) {
                      const decodedUrl = decodeURIComponent(img)
                      console.log("Extracted imgurl:", decodedUrl)
                      return decodedUrl
                    }
                  }
                }
                
                // Si es una ruta de TMDB (profile_path) sin host
                if (s.startsWith("/")) return `https://image.tmdb.org/t/p/w300${s}`
                
                // Si es ya una URL válida
                if (s.startsWith("http://") || s.startsWith("https://")) return s
                
                return null
              } catch (e) {
                console.error("Error parsing image URL:", e)
                return null
              }
            }
            
            const profileData = {
              id: Number(userData.id),
              username: userData.username || "usuario",
              email: userData.email || "",
              fullName: userData.realName || userData.fullName || userData.username || "Sin nombre",
              fotoPerfil: parseImageUrl(userData.fotoPerfil || userData.foto || userData.avatar || userData.image),
              descripcion: userData.descripcion || userData.bio || "",
              seguidores: userData.seguidores || userData.followers || 0,
              seguidos: userData.seguidos || userData.following || 0,
            }
            
            console.log("Setting profile data:", profileData)
            console.log("Profile image URL:", profileData.fotoPerfil)
            setProfile(profileData)
          } else {
            console.error("Error: Backend response no válido", backendResponse)
          }
        } else {
          console.error("Error: Usuario no encontrado o respuesta inválida", userResponse)
        }
        
        // Verificar si ya sigue a este usuario
        if (friends.length > 0) {
          setIsFollowing(friends.some(friend => friend.id === profileId))
        }
      } catch (error) {
        console.error("Error cargando perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    const loadUserComments = async () => {
      try {
        setLoadingComments(true)
        
        // Cargar todos los comentarios y filtrar por usuario
        const allComments = await reviewService.getAll()
        const userCommentsList = allComments.filter((c) => Number(c.idUser) === profileId)
        
        // Ordenar por más recientes primero y tomar solo los últimos 5
        const sorted = [...userCommentsList]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5)

        // Obtener información de películas para cada comentario
        const commentsWithMovies = await Promise.all(
          sorted.map(async (comment) => {
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
      } catch (error) {
        console.error("Error cargando comentarios del usuario:", error)
      } finally {
        setLoadingComments(false)
      }
    }

    if (profileId) {
      loadProfile()
      loadUserComments()
    }
  }, [profileId, friends])

  const handleFollowToggle = async () => {
    if (!isLoggedIn || isOwnProfile) return

    try {
      if (isFollowing) {
        const success = await unfollowUser(profileId)
        if (success) {
          setIsFollowing(false)
        }
      } else {
        const success = await followUser(profileId)
        if (success) {
          setIsFollowing(true)
        }
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Usuario no encontrado</h1>
          <p className="text-muted-foreground mb-4">El perfil que buscas no existe.</p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
      </div>

      {/* Información del perfil */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted shrink-0">
            {profile.fotoPerfil ? (
              <>
                <Image 
                  src={profile.fotoPerfil} 
                  alt={profile.username} 
                  fill 
                  className="object-cover"
                  unoptimized={profile.fotoPerfil.includes('google.com')}
                  onError={(e) => {
                    console.error("Error cargando imagen de perfil:", profile.fotoPerfil)
                    console.error("Error details:", e)
                    e.currentTarget.style.display = 'none'
                    // Mostrar el fallback
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.zIndex = '1'
                  }}
                  onLoad={() => {
                    console.log("Imagen de perfil cargada correctamente:", profile.fotoPerfil)
                  }}
                />
                {/* Fallback si la imagen falla al cargar */}
                <div className="w-full h-full flex items-center justify-center bg-muted-foreground/20 absolute inset-0 z-[-1]">
                  <span className="text-2xl font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted-foreground/20">
                <span className="text-2xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold">{profile.fullName || profile.username}</h2>
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.email && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                )}
                {profile.descripcion && (
                  <p className="text-sm mt-2 text-foreground">{profile.descripcion}</p>
                )}
              </div>
              
              {!isOwnProfile && isLoggedIn && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "secondary" : "default"}
                  className={isFollowing ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Dejar de seguir
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Seguir
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Estadísticas */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-semibold text-lg">{profile.seguidores ?? 0}</div>
                <div className="text-sm text-muted-foreground">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{profile.seguidos ?? 0}</div>
                <div className="text-sm text-muted-foreground">Siguiendo</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Comentarios recientes */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Comentarios recientes</h3>
        
        {loadingComments ? (
          <p className="text-center text-muted-foreground py-8">Cargando comentarios...</p>
        ) : userComments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {isOwnProfile 
                ? "Aún no has comentado ninguna película." 
                : "Este usuario aún no ha comentado ninguna película."
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {userComments.map((comment) => (
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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}