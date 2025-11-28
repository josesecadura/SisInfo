"use client"

import { useState, useEffect } from "react"
import { Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentCard } from "@/components/comment-card"
import { useRouter } from "next/navigation"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"
import { commentLikeService } from "@/lib/api/services/commentLike.service"
import { useCurrentUser } from "@/hooks/use-current-user"

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
  likedByUser?: boolean
}

export default function PopularesPage() {
  const [allComments, setAllComments] = useState<CommentWithMovie[]>([])
  const [displayedComments, setDisplayedComments] = useState<CommentWithMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const { user: currentUser, isLoggedIn } = useCurrentUser()

  const COMMENTS_PER_LOAD = 10

  useEffect(() => {
    const loadComments = async () => {
      try {
        const comments = await reviewService.getAll()
        // Ordenar por likes descendente
        const sorted = [...comments].sort((a, b) => (b.numLikes ?? 0) - (a.numLikes ?? 0))

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

        setAllComments(commentsWithMovies)
        // Mostrar los primeros 10 comentarios
        setDisplayedComments(commentsWithMovies.slice(0, COMMENTS_PER_LOAD))
        setCurrentIndex(COMMENTS_PER_LOAD)
        console.log(`Cargados ${commentsWithMovies.length} comentarios populares, mostrando primeros ${COMMENTS_PER_LOAD}`)
      } catch (err) {
        console.error("Error cargando comentarios:", err)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [])

  const loadMoreComments = () => {
    setLoadingMore(true)
    
    setTimeout(() => {
      const nextComments = allComments.slice(currentIndex, currentIndex + COMMENTS_PER_LOAD)
      setDisplayedComments(prev => [...prev, ...nextComments])
      setCurrentIndex(prev => prev + COMMENTS_PER_LOAD)
      setLoadingMore(false)
      console.log(`Cargados ${nextComments.length} comentarios adicionales`)
    }, 500) // Pequeño delay para mejor UX
  }

  const hasMoreComments = currentIndex < allComments.length

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
        <h1 className="text-4xl font-bold">Más populares</h1>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando comentarios...</p>
        ) : displayedComments.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay comentarios disponibles.</p>
        ) : (
          displayedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              user={comment.username}
              content={comment.descripcion}
              likes={comment.numLikes ?? 0}
              movieImage={comment.movieImage ?? comment.imagenPelicula ?? null}
              movieId={comment.idPelicula}
              showPoster={true}
              commentId={comment.id}
              userId={comment.idUser}
              likedByUser={comment.likedByUser}
              onCommentDeleted={(deletedId) => {
                // Eliminar comentario de las listas locales
                setDisplayedComments(prev => prev.filter(c => c.id !== deletedId))
                setAllComments(prev => prev.filter(c => c.id !== deletedId))
              }}
            />
          ))
        )}
        
        {/* Botón "Ver más" */}
        {hasMoreComments && (
          <div className="text-center pt-6">
            <Button
              onClick={loadMoreComments}
              disabled={loadingMore}
              variant="outline"
              size="lg"
            >
              {loadingMore ? "Cargando..." : "Ver más comentarios"}
            </Button>
          </div>
        )}
        
        {!hasMoreComments && displayedComments.length > 0 && (
          <div className="text-center pt-6">
            <p className="text-muted-foreground">
              Has visto todos los comentarios populares
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
