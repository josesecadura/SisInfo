"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentCard } from "@/components/comment-card"
import { useRouter, useSearchParams } from "next/navigation"
import { userService, User } from "@/lib/api/services/user.service"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"
import { useCurrentUser } from "@/hooks/use-current-user"
import { commentLikeService } from "@/lib/api/services/commentLike.service"

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
}

export default function ComentariosClient() {
  const [userComments, setUserComments] = useState<CommentWithMovie[]>([])
  const [likedComments, setLikedComments] = useState<CommentWithMovie[]>([])
  const [allUserComments, setAllUserComments] = useState<CommentWithMovie[]>([])
  const [allLikedComments, setAllLikedComments] = useState<CommentWithMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLiked, setLoadingLiked] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [visibleUserComments, setVisibleUserComments] = useState(10)
  const [visibleLikedComments, setVisibleLikedComments] = useState(10)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: currentUser, isLoggedIn } = useCurrentUser()
  
  // Obtener tab desde URL params, por defecto 'mis-comentarios'
  const [activeTab, setActiveTab] = useState<'mis-comentarios' | 'me-gustaron'>('mis-comentarios')

  // Manejar parámetro de tab desde URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'me-gustaron') {
      setActiveTab('me-gustaron')
    }
  }, [searchParams])

  useEffect(() => {
    const loadUserComments = async () => {
      setLoading(true)
      try {
        if (!isLoggedIn || !currentUser) {
          setLoading(false)
          return
        }

        const allComments = await reviewService.getAll()
        const userCommentsList = allComments.filter((c) => String(c.idUser) === String(currentUser.id))
        const sorted = [...userCommentsList].sort((a, b) => b.id - a.id)

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
              console.error(`Error cargando datos para comentario ${comment.id}:`, err)
              return {
                ...comment,
                movieImage: null,
              }
            }
          })
        )

        setAllUserComments(commentsWithMovies)
        setUserComments(commentsWithMovies.slice(0, 10))
      } catch (err) {
        console.error("Error cargando comentarios:", err)
      } finally {
        setLoading(false)
      }
    }

    loadUserComments()
  }, [isLoggedIn, currentUser])

  useEffect(() => {
    const loadLikedComments = async () => {
      setLoadingLiked(true)
      try {
        if (!isLoggedIn || !currentUser) {
          setLoadingLiked(false)
          return
        }

        const likedCommentsIds = await commentLikeService.getUserLikedComments(Number(currentUser.id))
        
        if (!likedCommentsIds || likedCommentsIds.length === 0) {
          setAllLikedComments([])
          setLikedComments([])
          setLoadingLiked(false)
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

        setAllLikedComments(commentsWithMovies)
        setLikedComments(commentsWithMovies.slice(0, 10))
      } catch (err) {
        console.error("Error cargando comentarios likeados:", err)
      } finally {
        setLoadingLiked(false)
      }
    }

    loadLikedComments()
  }, [isLoggedIn, currentUser])

  const loadMoreUserComments = async () => {
    setLoadingMore(true)
    const newVisible = visibleUserComments + 5
    setVisibleUserComments(newVisible)
    setUserComments(allUserComments.slice(0, newVisible))
    setTimeout(() => setLoadingMore(false), 300)
  }

  const loadMoreLikedComments = async () => {
    setLoadingMore(true)
    const newVisible = visibleLikedComments + 5
    setVisibleLikedComments(newVisible)
    setLikedComments(allLikedComments.slice(0, newVisible))
    setTimeout(() => setLoadingMore(false), 300)
  }

  const hasMoreUserComments = allUserComments.length > visibleUserComments
  const hasMoreLikedComments = allLikedComments.length > visibleLikedComments

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
        <h1 className="text-4xl font-bold">Comentarios</h1>
      </div>

      <div className="flex gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab('mis-comentarios')}
          className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
            activeTab === 'mis-comentarios'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Mis comentarios
        </button>
        <button
          onClick={() => setActiveTab('me-gustaron')}
          className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
            activeTab === 'me-gustaron'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Me gustaron
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'mis-comentarios' ? (
          <>
            {loading ? (
              <p className="text-center text-muted-foreground">Cargando comentarios...</p>
            ) : !isLoggedIn ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Debes iniciar sesión para ver tus comentarios.</p>
              </div>
            ) : userComments.length === 0 ? (
              <p className="text-center text-muted-foreground">No tienes comentarios.</p>
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
                    userId={comment.idUser}
                    onCommentDeleted={() => {
                      setUserComments(prev => prev.filter(c => c.id !== comment.id))
                      setAllUserComments(prev => prev.filter(c => c.id !== comment.id))
                    }}
                  />
                ))}
                
                {hasMoreUserComments && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={loadMoreUserComments}
                      disabled={loadingMore}
                      variant="outline"
                      className="px-8"
                    >
                      {loadingMore ? "Cargando..." : "VER MÁS"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {loadingLiked ? (
              <p className="text-center text-muted-foreground">Cargando comentarios...</p>
            ) : !isLoggedIn ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Debes iniciar sesión para ver comentarios que te gustaron.</p>
              </div>
            ) : likedComments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No has dado me gusta a ningún comentario todavía.</p>
                <p className="text-sm text-muted-foreground">Explora películas y da like a comentarios que te parezcan interesantes.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {likedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    commentId={comment.id}
                    user={comment.username}
                    content={comment.descripcion}
                    likes={comment.numLikes ?? 0}
                    movieImage={comment.movieImage ?? comment.imagenPelicula ?? null}
                    movieId={comment.idPelicula}
                    showPoster={true}
                    userId={comment.idUser}
                    defaultLiked={true}
                    onLikeChange={(liked) => {
                      if (!liked) {
                        setLikedComments(prev => prev.filter(c => c.id !== comment.id))
                        setAllLikedComments(prev => prev.filter(c => c.id !== comment.id))
                      }
                    }}
                  />
                ))}
                
                {hasMoreLikedComments && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={loadMoreLikedComments}
                      disabled={loadingMore}
                      variant="outline"
                      className="px-8"
                    >
                      {loadingMore ? "Cargando..." : "VER MÁS"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
