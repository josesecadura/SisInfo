"use client"

import { useState, useEffect } from "react"
import { AuthRequired } from "@/components/auth-required"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CommentCard } from "@/components/comment-card"
import { useRouter } from "next/navigation"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
}

export default function MasRecientesPage() {
  const [allComments, setAllComments] = useState<CommentWithMovie[]>([])
  const [displayedComments, setDisplayedComments] = useState<CommentWithMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentCount, setCurrentCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const router = useRouter()
  
  const INITIAL_LOAD = 10
  const MAX_TOTAL = 30 // 10 inicial + 20 máximo adicionales

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true)
        
        // Obtener todos los comentarios
        const comments = await reviewService.getAll()
        console.log('Comentarios obtenidos para Más Recientes:', comments.length)
        
        // Ordenar por ID descendente (más recientes primero)
        const sorted = [...comments].sort((a, b) => b.id - a.id)
        
        // Limitar a 30 comentarios máximo
        const limited = sorted.slice(0, MAX_TOTAL)
        setAllComments(limited)
        
        // Cargar los primeros 10 comentarios
        const initial = limited.slice(0, INITIAL_LOAD)
        
        // Obtener información de películas para los comentarios iniciales
        const commentsWithMovies = await Promise.all(
          initial.map(async (comment) => {
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

        setDisplayedComments(commentsWithMovies)
        setCurrentCount(initial.length)
        setHasMore(limited.length > INITIAL_LOAD)
        
        console.log(`Cargados ${commentsWithMovies.length} comentarios iniciales de ${limited.length} totales`)
      } catch (err) {
        console.error("Error cargando comentarios:", err)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [])

  const loadMoreComments = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      // Calcular cuántos más cargar (máximo 10 a la vez, hasta 30 total)
      const nextBatch = allComments.slice(currentCount, currentCount + 10)
      
      // Obtener información de películas para los nuevos comentarios
      const commentsWithMovies = await Promise.all(
        nextBatch.map(async (comment) => {
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
      
      setDisplayedComments(prev => [...prev, ...commentsWithMovies])
      setCurrentCount(prev => prev + nextBatch.length)
      setHasMore((currentCount + nextBatch.length) < allComments.length && (currentCount + nextBatch.length) < MAX_TOTAL)
      
      console.log(`Cargados ${nextBatch.length} comentarios adicionales. Total: ${currentCount + nextBatch.length}`)
    } catch (err) {
      console.error("Error cargando más comentarios:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold">Más Recientes</h1>
        </div>
        
        <p className="text-center text-muted-foreground">
          Cargando comentarios más recientes...
        </p>
      </div>
    )
  }

  // No hay comentarios disponibles
  if (displayedComments.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold">Más Recientes</h1>
        </div>
        
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sin comentarios</h3>
          <p className="text-muted-foreground mb-4">
            Aún no hay comentarios disponibles.
          </p>
          <Button variant="outline" onClick={() => router.push("/community")}>
            Volver a comunidad
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <AuthRequired>
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
        <h1 className="text-4xl font-bold">Más Recientes</h1>
        <p className="text-muted-foreground text-sm">
          ({displayedComments.length} de {allComments.length} comentarios más recientes)
        </p>
      </div>

      {/* Lista de comentarios más recientes */}
      <div className="space-y-6">
        {displayedComments.map((comment) => (
          <CommentCard
            key={comment.id}
            user={comment.username}
            content={comment.descripcion}
            likes={comment.numLikes ?? 0}
            movieImage={comment.imagenPelicula}
            movieId={comment.idPelicula}
            showPoster={true}
            commentId={comment.id}
            userId={comment.idUser}
            onCommentDeleted={(deletedId) => {
              // Eliminar comentario de las listas locales
              setDisplayedComments(prev => prev.filter(c => c.id !== deletedId))
              setAllComments(prev => prev.filter(c => c.id !== deletedId))
              setCurrentCount(prev => Math.max(0, prev - 1))
            }}
          />
        ))}
      </div>
      
      {/* Botón Ver Más */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={loadMoreComments}
            disabled={loadingMore}
            variant="outline"
            className="px-8"
          >
            {loadingMore ? "Cargando..." : "VER MÁS"}
          </Button>
        </div>
      )}
      </div>
    </AuthRequired>
  )
}
