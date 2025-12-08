"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CommentCard } from "@/components/comment-card"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"
import { commentLikeService } from "@/lib/api/services/commentLike.service"
import { useRouter } from "next/navigation"
import { ActividadService } from "@/lib/api/services/actividad.service"

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
}

interface CommentsSectionProps {
  userId: string | number
}

export function CommentsSection({ userId }: CommentsSectionProps) {
  const [userComments, setUserComments] = useState<CommentWithMovie[]>([])
  const [likedComments, setLikedComments] = useState<CommentWithMovie[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingLikedComments, setLoadingLikedComments] = useState(false)
  const [commentsTab, setCommentsTab] = useState<'mis-comentarios' | 'me-gustaron'>('mis-comentarios')
  const router = useRouter()

  // Cargar comentarios del usuario
  useEffect(() => {
    if (!userId) return

    const loadUserComments = async () => {
      setLoadingComments(true)
      try {
        const allComments = await reviewService.getAll()
        const userCommentsList = allComments.filter((c) => String(c.idUser) === String(userId))
        const sorted = [...userCommentsList].sort((a, b) => a.idPelicula - b.idPelicula)
        const topFive = sorted.slice(0, 5)

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
  }, [userId])

  // Cargar comentarios que le gustaron al usuario
  useEffect(() => {
    if (!userId) return

    const loadLikedComments = async () => {
      setLoadingLikedComments(true)
      try {
        const likedCommentsIds = await commentLikeService.getUserLikedComments(Number(userId))
        
        if (!likedCommentsIds || likedCommentsIds.length === 0) {
          setLikedComments([])
          return
        }

        const allComments = await reviewService.getAll()
        
        const likedCommentsList = allComments.filter(comment => 
          likedCommentsIds.some((likedId: any) => {
            const commentId = typeof likedId === 'object' ? likedId.id : likedId
            return comment.id === commentId
          })
        )
        
        const sorted = [...likedCommentsList].sort((a, b) => b.id - a.id)
        const topFive = sorted.slice(0, 5)

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
  }, [userId])

  const reloadUserComments = async () => {
    if (!userId) return

    setLoadingComments(true)
    try {
      const allComments = await reviewService.getAll()
      const userCommentsList = allComments.filter((c) => String(c.idUser) === String(userId))
      const sorted = [...userCommentsList].sort((a, b) => a.idPelicula - b.idPelicula)
      const topFive = sorted.slice(0, 5)

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
      // Registrar evento de publicación
      await ActividadService.registrarActividad({
        tipoActividad: "COMENTARIO_PUBLICADO",
        idUsuario: Number(userId),
        detalles: "Comentario nuevo"
      })
    } catch (err) {
      console.error("Error cargando comentarios del usuario:", err)
    } finally {
      setLoadingComments(false)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Comentarios</h2>
        <Button
          variant="link"
          className="text-primary"
          onClick={() => {
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
                onCommentDeleted={reloadUserComments}
              />
            ))
          )
        ) : (
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
                    setLikedComments(prev => prev.filter(c => c.id !== comment.id))
                  }
                }}
              />
            ))
          )
        )}
      </div>
    </section>
  )
}
