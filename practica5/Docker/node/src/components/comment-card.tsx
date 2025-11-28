"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Heart, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { reviewService } from "@/lib/api/services/review.service"
import { commentLikeService } from "@/lib/api/services/commentLike.service"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface CommentCardProps {
  user: string
  content: string
  likes: number
  movieImage?: string | null
  movieId?: number | string
  userAvatar?: string | null
  className?: string
  defaultLiked?: boolean
  likedByUser?: boolean
  onLikeChange?: (liked: boolean, newCount?: number) => void
  showPoster?: boolean
  commentId?: number | string
  userId?: number | string  // ID del usuario que escribió el comentario
  onCommentDeleted?: (commentId: number | string) => void  // Callback para cuando se elimina
}

export function CommentCard({
  user,
  content,
  likes,
  movieImage,
  movieId,
  userAvatar,
  className,
  defaultLiked = false,
  likedByUser,
  onLikeChange,
  showPoster = true,
  commentId,
  userId,
  onCommentDeleted,
}: CommentCardProps) {
  const [liked, setLiked] = useState(defaultLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [updating, setUpdating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [likeStateChecked, setLikeStateChecked] = useState(likedByUser !== undefined)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user: currentUser, isLoggedIn } = useCurrentUser()
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const userInitial = user?.trim()?.charAt(0)?.toUpperCase() || "?"

  // Verificar si el comentario pertenece al usuario actual
  const isOwnComment = isLoggedIn && currentUser && userId && 
    (Number(currentUser.id) === Number(userId))

  // Función para manejar la eliminación del comentario
  const handleDeleteComment = async () => {
    if (!commentId) return
    
    setDeleting(true)
    try {
      await reviewService.delete(commentId)
      onCommentDeleted?.(commentId)
      toast.success("Comentario eliminado exitosamente")
    } catch (error) {
      console.error("Error al eliminar comentario:", error)
      toast.error("Error al eliminar el comentario")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Función para navegar al perfil del usuario
  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Click en usuario:', { userId, currentUserId: currentUser?.id, user })
    
    if (!userId) {
      console.log('No hay userId disponible')
      return
    }
    
    if (Number(userId) === Number(currentUser?.id)) {
      console.log('Es el perfil del usuario actual, no navegando')
      return
    }
    
    console.log('Navegando al perfil:', `/profile/${userId}`)
    router.push(`/profile/${userId}`)
  }

  // Si ya se proporcionó likedByUser, usarlo inmediatamente
  useEffect(() => {
    if (likedByUser !== undefined) {
      setLiked(likedByUser)
      setLikeStateChecked(true)
    }
  }, [likedByUser])

  // Intersection Observer para detectar visibilidad
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Solo necesitamos detectar la primera vez que es visible
        }
      },
      {
        rootMargin: '100px', // Cargar cuando esté a 100px de ser visible
        threshold: 0.1
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Verificar estado inicial del like usando el endpoint solo cuando sea visible
  useEffect(() => {
    const checkInitialLikeState = async () => {
      // Solo verificar si es visible, está logueado, no se ha verificado antes y no se proporcionó likedByUser
      if (!isVisible || !isLoggedIn || !currentUser || !commentId || checking || likeStateChecked) {
        return
      }
      
      setChecking(true)
      try {
        console.log(`Verificando like para comentario visible ${commentId}`)
        const hasLike = await commentLikeService.checkUserLike(
          Number(currentUser.id), 
          Number(commentId)
        )
        setLiked(hasLike)
        setLikeStateChecked(true)
      } catch (error) {
        console.error("Error verificando estado inicial del like:", error)
        setLiked(defaultLiked)
        setLikeStateChecked(true)
      } finally {
        setChecking(false)
      }
    }

    checkInitialLikeState()
  }, [isVisible, commentId, currentUser, isLoggedIn, defaultLiked, checking, likeStateChecked])

  useEffect(() => {
    // Actualizar contador cuando cambie la prop likes
    setLikeCount(likes)
  }, [likes])

  const handleLikeToggle = async () => {
    if (updating || checking || !isLoggedIn || !currentUser || !commentId) {
      if (!isLoggedIn) {
        console.warn("Usuario debe estar logueado para dar likes")
      }
      return
    }
    
    const userId = Number(currentUser.id)
    if (!userId) {
      console.error("Usuario no válido para dar like")
      return
    }

    setUpdating(true)
    
    try {
      let success = false
      let newLiked = false
      let newCount = likeCount
      
      if (liked) {
        // Si ya tiene like, lo quitamos
        success = await commentLikeService.unlikeComment(userId, Number(commentId))
        if (success) {
          newLiked = false
          newCount = Math.max(0, likeCount - 1)
        }
      } else {
        // Si no tiene like, lo añadimos
        success = await commentLikeService.likeComment(userId, Number(commentId))
        if (success) {
          newLiked = true
          newCount = likeCount + 1
        }
      }
      
      if (success) {
        setLiked(newLiked)
        setLikeCount(newCount)
        onLikeChange?.(newLiked, newCount)
        console.log(`Like ${newLiked ? 'añadido' : 'removido'} exitosamente`)
      } else {
        console.warn("No se pudo realizar la acción de like")
      }
    } catch (err) {
      console.error("Error al manejar like del comentario:", err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div ref={cardRef} className={cn("flex gap-4 p-4 rounded-xl border-2 border-primary/30 bg-card", className)}>
      {showPoster && (
        <button
          onClick={() => movieId && router.push(`/movie/${movieId}`)}
          className="relative w-20 md:w-24 h-28 md:h-36 shrink-0 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Ver película"
        >
          {movieImage ? (
            <Image
              src={movieImage}
              alt="Movie poster"
              fill
              className="object-cover"
              sizes="96px"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center">
              Sin imagen
            </div>
          )}
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Avatar y nombre clickeables */}
            <button
              onClick={handleUserClick}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 transition-all duration-200 ${
                userId && Number(userId) !== Number(currentUser?.id) 
                  ? 'cursor-pointer hover:bg-primary/10 hover:scale-[1.02]' 
                  : 'cursor-default'
              }`}
              disabled={!userId || Number(userId) === Number(currentUser?.id)}
              title={userId && Number(userId) !== Number(currentUser?.id) ? `Ver perfil de ${user}` : undefined}
              type="button"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0 text-sm font-bold text-muted-foreground">
                {userInitial}
              </div>
              <span className={`font-bold truncate transition-colors duration-200 ${
                userId && Number(userId) !== Number(currentUser?.id) ? 'hover:text-primary' : ''
              }`}>{user}</span>
            </button>
          </div>
          
          {/* Menú de opciones para comentarios propios */}
          {isOwnComment && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{content}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLikeToggle}
            className={cn(
              "flex items-center gap-2 rounded-full px-2 py-1 transition-colors",
              liked ? "text-red-500" : "text-muted-foreground hover:text-red-500",
              (!isLoggedIn || checking) && "opacity-50 cursor-not-allowed"
            )}
            aria-pressed={liked}
            aria-label={liked ? "Quitar like" : "Dar like"}
            disabled={updating || checking || !isLoggedIn}
            title={!isLoggedIn ? "Inicia sesión para dar like" : checking ? "Verificando estado..." : ""}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-all", 
                (updating || checking) && "animate-pulse"
              )} 
              fill={liked ? "currentColor" : "none"} 
              aria-hidden="true" 
            />
            <span className="font-bold text-sm">{likeCount}</span>
          </button>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar comentario */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
