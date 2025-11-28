"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "lucide-react"
import { reviewService, BackendComment } from "@/lib/api/services/review.service"
import { movieService, Movie } from "@/lib/api/services/movie.service"
import { usuarioSeguidorService } from "@/lib/api/services/usuarioSeguidor.service"
import { encuestaService, type Encuesta, type VoteEncuestaDTO } from "@/lib/api/services/encuesta.service"
import { CommentCard } from "@/components/comment-card"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

interface CommentWithMovie extends BackendComment {
  movieImage?: string | null
}

export default function CommunityPage() {
  // Estados para comentarios principales
  const [popularComments, setPopularComments] = useState<CommentWithMovie[]>([])
  const [friendsComments, setFriendsComments] = useState<CommentWithMovie[]>([])
  
  // Estados para encuestas
  const [encuestas, setEncuestas] = useState<Encuesta[]>([])
  const [userVotes, setUserVotes] = useState<Record<number, number>>({}) // encuestaId -> opción votada
  
  // Estados generales
  const [activeTab, setActiveTab] = useState<"principal" | "encuestas">("principal")
  const [loading, setLoading] = useState(true)
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [votingLoading, setVotingLoading] = useState<Record<number, boolean>>({})
  
  const { user, isLoggedIn } = useCurrentUser()
  const router = useRouter()

  // Función para cargar comentarios populares
  const loadPopularComments = async () => {
    try {
      const allComments = await reviewService.getAll()
      
      // Ordenar por likes descendente y tomar los 2 primeros
      const sorted = [...allComments].sort((a, b) => (b.numLikes ?? 0) - (a.numLikes ?? 0))
      const topTwo = sorted.slice(0, 2)

      // Obtener información de películas
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

      setPopularComments(commentsWithMovies)
      return topTwo.map(c => c.id) // Devolver IDs para excluir en recientes
    } catch (error) {
      console.error("Error loading popular comments:", error)
      setPopularComments([])
      return []
    }
  }

  // Función para cargar comentarios de amigos
  const loadFriendsComments = async () => {
    if (!isLoggedIn || !user) {
      setFriendsComments([])
      return
    }

    setLoadingFriends(true)
    try {
      // Obtener lista de amigos
      const friends = await usuarioSeguidorService.getAmigos(Number(user.id))
      
      if (friends.length === 0) {
        setFriendsComments([])
        setLoadingFriends(false)
        return
      }

      // Obtener todos los comentarios
      const allComments = await reviewService.getAll()
      
      // Filtrar comentarios de amigos
      const friendIds = friends.map(f => f.id)
      const friendsCommentsList = allComments.filter(comment => 
        friendIds.includes(comment.idUser)
      )

      // Ordenar por ID descendente y tomar los primeros 5
      const sortedByDate = [...friendsCommentsList].sort((a, b) => b.id - a.id)
      const friendsTop = sortedByDate.slice(0, 5)

      // Obtener información de películas
      const commentsWithMovies = await Promise.all(
        friendsTop.map(async (comment) => {
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

      setFriendsComments(commentsWithMovies)
    } catch (err) {
      console.error("Error cargando comentarios de amigos:", err)
      setFriendsComments([])
    } finally {
      setLoadingFriends(false)
    }
  }

  // Función para cargar encuestas activas
  const loadEncuestas = async () => {
    try {
      // Usar el nuevo endpoint que devuelve solo encuestas activas
      const encuestasActivas = await encuestaService.getActive()
      
      // Verificar que los campos porcentaje1-4 sean contadores de votos, no porcentajes
      encuestasActivas.forEach(e => {
        console.debug(`[loadEncuestas] Encuesta ${e.id}: porcentaje1=${e.porcentaje1}, porcentaje2=${e.porcentaje2}, porcentaje3=${e.porcentaje3}, porcentaje4=${e.porcentaje4}`)
      })
      
      setEncuestas(encuestasActivas)
      console.debug('[loadEncuestas] Estado de encuestas actualizado con', encuestasActivas.length, 'encuestas activas')

      // Cargar votos del usuario si está autenticado
      if (isLoggedIn && user?.id) {
        const encuestaIds = encuestasActivas.map(e => e.id)
        console.debug('[loadEncuestas] Usuario autenticado, cargando votos para encuestas:', encuestaIds)
        await loadUserVotes(encuestaIds)
      } else {
        console.debug('[loadEncuestas] Usuario no autenticado, saltando carga de votos')
      }
    } catch (error) {
      console.error("Error loading encuestas:", error)
      setEncuestas([])
    }
  }

  // Función para cargar votos del usuario
  const loadUserVotes = async (encuestaIds: number[]) => {
    if (!user?.id) {
      console.debug('[loadUserVotes] No hay usuario autenticado, saltando carga de votos')
      return
    }

    console.debug('[loadUserVotes] Iniciando carga de votos para encuestas:', encuestaIds)
    console.debug('[loadUserVotes] Usuario:', user.id)

    const votes: Record<number, number> = {}
    
    // Cargar votos en paralelo pero con manejo de errores mejorado
    const votePromises = encuestaIds.map(async (encuestaId) => {
      try {
        console.debug(`[loadUserVotes] Verificando voto para encuesta ${encuestaId}...`)
        const voto = await encuestaService.getVote(encuestaId, Number(user.id))
        console.debug(`[loadUserVotes] Resultado para encuesta ${encuestaId}:`, voto)
        
        if (voto && voto.opcionSeleccionada) {
          votes[encuestaId] = voto.opcionSeleccionada
          console.debug(`[loadUserVotes] Usuario ya votó en encuesta ${encuestaId}, opción: ${voto.opcionSeleccionada}`)
        } else {
          console.debug(`[loadUserVotes] Usuario NO ha votado en encuesta ${encuestaId}`)
        }
      } catch (error) {
        // 404 es normal cuando el usuario no ha votado, no es un error
        const errorMsg = (error as Error).message || ""
        if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
          console.debug(`[loadUserVotes] Confirmado: Usuario no ha votado en encuesta ${encuestaId} (404)`)
        } else {
          console.error(`[loadUserVotes] Error inesperado para encuesta ${encuestaId}:`, error)
        }
      }
    })

    await Promise.allSettled(votePromises)
    
    console.debug('[loadUserVotes] Votos finales cargados:', votes)
    setUserVotes(votes)
    console.debug('[loadUserVotes] Estado de userVotes actualizado')
  }

  // Función para votar en una encuesta
  const handleVote = async (encuestaId: number, opcion: number) => {
    if (!isLoggedIn || !user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para votar",
        variant: "destructive"
      })
      return
    }

    // Verificar si está cambiando su voto
    const previousVote = userVotes[encuestaId]
    const isChangingVote = previousVote && previousVote !== opcion
    const isVotingFirst = !previousVote
    
    // Si está votando la misma opción, no hacer nada
    if (previousVote === opcion) {
      toast({
        title: "Ya votaste esta opción",
        description: "Ya tienes seleccionada esta opción",
      })
      return
    }

    setVotingLoading(prev => ({ ...prev, [encuestaId]: true }))

    try {
      const voteData: VoteEncuestaDTO = {
        idUser: Number(user.id),
        idEncuesta: encuestaId,
        opcionSeleccionada: opcion
      }

      console.debug('[handleVote] Enviando voto:', voteData)
      console.debug('[handleVote] Voto anterior:', previousVote, 'Nuevo voto:', opcion)

      await encuestaService.vote(voteData)

      // Actualizar el estado local inmediatamente para feedback visual
      setUserVotes(prev => ({ ...prev, [encuestaId]: opcion }))
      
      // Actualizar localmente los contadores de la encuesta para feedback inmediato
      setEncuestas(prev => prev.map(enc => {
        if (enc.id === encuestaId) {
          const updated = { ...enc }
          
          // Si estaba cambiando voto, decrementar el anterior
          if (previousVote) {
            if (previousVote === 1) updated.porcentaje1 = Math.max(0, (updated.porcentaje1 || 0) - 1)
            else if (previousVote === 2) updated.porcentaje2 = Math.max(0, (updated.porcentaje2 || 0) - 1)
            else if (previousVote === 3) updated.porcentaje3 = Math.max(0, (updated.porcentaje3 || 0) - 1)
            else if (previousVote === 4) updated.porcentaje4 = Math.max(0, (updated.porcentaje4 || 0) - 1)
          }
          
          // Incrementar el nuevo voto
          if (opcion === 1) updated.porcentaje1 = (updated.porcentaje1 || 0) + 1
          else if (opcion === 2) updated.porcentaje2 = (updated.porcentaje2 || 0) + 1
          else if (opcion === 3) updated.porcentaje3 = (updated.porcentaje3 || 0) + 1
          else if (opcion === 4) updated.porcentaje4 = (updated.porcentaje4 || 0) + 1
          
          return updated
        }
        return enc
      }))

      toast({
        title: isChangingVote ? "¡Voto actualizado!" : "¡Voto registrado!",
        description: isChangingVote 
          ? "Has cambiado tu voto correctamente" 
          : "Tu voto ha sido registrado correctamente",
      })

      // NO recargar automáticamente para evitar el parpadeo visual
      // Los contadores locales ya están actualizados correctamente

    } catch (error) {
      console.error("Error voting:", error)
      const errorMsg = (error as Error).message || ""
      
      // Si el backend falló pero se usó localStorage como fallback
      if (errorMsg.includes("Backend error - fallback usado")) {
        // Actualizar el estado local de todas formas
        setUserVotes(prev => ({ ...prev, [encuestaId]: opcion }))
        
        // Intentar recargar las encuestas por si hay cambios
        try {
          await loadEncuestas()
        } catch (reloadError) {
          console.warn("Could not reload encuestas after vote:", reloadError)
        }
        
        toast({
          title: isChangingVote ? "¡Voto actualizado (offline)!" : "¡Voto registrado (offline)!",
          description: "Tu voto se ha guardado localmente debido a un problema del servidor.",
          variant: "destructive"
        })
      } else {
        // Revertir el estado local en caso de error real
        setUserVotes(prev => {
          const newVotes = { ...prev }
          if (previousVote) {
            newVotes[encuestaId] = previousVote
          } else {
            delete newVotes[encuestaId]
          }
          return newVotes
        })
        
        toast({
          title: "Error al votar",
          description: "No se pudo registrar tu voto. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    } finally {
      setVotingLoading(prev => ({ ...prev, [encuestaId]: false }))
    }
  }

  // Calcular porcentajes de votación (los campos porcentaje1-4 son CONTADORES de votos, no porcentajes)
  const calculatePercentages = (encuesta: Encuesta) => {
    // Los campos porcentaje1, porcentaje2, porcentaje3, porcentaje4 son contadores de votos
    const votes1 = encuesta.porcentaje1 || 0
    const votes2 = encuesta.porcentaje2 || 0
    const votes3 = encuesta.porcentaje3 || 0
    const votes4 = encuesta.porcentaje4 || 0
    
    const totalVotes = votes1 + votes2 + votes3 + votes4
    
    if (totalVotes === 0) {
      return { p1: 0, p2: 0, p3: 0, p4: 0, total: 0, votes1, votes2, votes3, votes4 }
    }

    return {
      p1: Math.round((votes1 / totalVotes) * 100),
      p2: Math.round((votes2 / totalVotes) * 100),
      p3: Math.round((votes3 / totalVotes) * 100),
      p4: Math.round((votes4 / totalVotes) * 100),
      total: totalVotes,
      votes1,
      votes2,
      votes3,
      votes4
    }
  }


  // Cargar datos iniciales
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      try {
        if (activeTab === "principal") {
          // Cargar comentarios populares primero
          const excludeIds = await loadPopularComments()
          
          // Cargar comentarios de amigos si el usuario está autenticado
          if (isLoggedIn) {
            await loadFriendsComments()
          }
          
        } else if (activeTab === "encuestas") {
          // Solo cargar encuestas cuando está en la pestaña de encuestas
          await loadEncuestas()
        }
      } catch (error) {
        console.error("Error loading community data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [activeTab, isLoggedIn, user?.id])

  // Renderizar opción de encuesta con diseño de admin (barras de progreso)
  const renderVoteOption = (
    encuesta: Encuesta,
    opcionNum: number,
    opcionTexto: string | undefined,
    votesCount: number,
    percentage: number,
  ) => {
    if (!opcionTexto?.trim()) return null

    const userVoted = userVotes[encuesta.id]
    const isSelected = userVoted === opcionNum
    const canVote = isLoggedIn && !votingLoading[encuesta.id]

    // Log para depurar la persistencia
    if (userVoted) {
      console.debug(`[renderVoteOption] Encuesta ${encuesta.id}: Usuario ya votó opción ${userVoted}, renderizando opción ${opcionNum}, isSelected: ${isSelected}`)
    }

    return (
      <div key={opcionNum} className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
            isSelected 
              ? "border-primary bg-primary/10" 
              : canVote
                ? "border-border hover:border-primary/50 bg-background"
                : "border-border bg-background"
          }`}
          onClick={() => canVote && handleVote(encuesta.id, opcionNum)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              isSelected ? "border-primary bg-primary" : "border-muted-foreground"
            }`}>
              {isSelected && (
                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
              )}
            </div>
            <span className={`font-medium ${
              isSelected ? "text-primary" : "text-foreground"
            }`}>
              {opcionTexto}
            </span>
            {isSelected && (
              <Badge variant="outline" className="ml-auto mr-2">
                Tu voto
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[3ch] text-right">
              {percentage}%
            </span>
            <Badge variant="secondary" className="min-w-[4ch]">
              {votesCount}
            </Badge>
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comunidad</h1>
        <p className="text-muted-foreground">
          Conecta con otros usuarios y participa en las conversaciones
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveTab("principal")}
          className={`py-6 rounded-2xl text-2xl font-bold transition-all ${
            activeTab === "principal"
              ? "bg-blue-950/50 border-2 border-blue-500/50"
              : "bg-card border-2 border-border hover:border-blue-500/30"
          }`}
        >
          Principal
        </button>
        <button
          onClick={() => setActiveTab("encuestas")}
          className={`py-6 rounded-2xl text-2xl font-bold transition-all ${
            activeTab === "encuestas"
              ? "bg-purple-950/50 border-2 border-primary/50"
              : "bg-card border-2 border-border hover:border-primary/30"
          }`}
        >
          Encuestas
        </button>
      </div>

      {/* Contenido Principal */}
      {activeTab === "principal" && (
        <>
          {/* Más populares Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Más populares</h2>
              <Button
                variant="link"
                className="text-primary"
                onClick={() => router.push("/community/populares")}
              >
                VER MÁS →
              </Button>
            </div>
            <div className="space-y-6">
              {loading ? (
                <p className="text-center text-muted-foreground">Cargando comentarios...</p>
              ) : popularComments.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay comentarios disponibles.</p>
              ) : (
                popularComments.map((comment) => (
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
                    onCommentDeleted={() => {
                      setPopularComments(prev => prev.filter(c => c.id !== comment.id))
                    }}
                  />
                ))
              )}
            </div>
          </section>

          {/* Mis Amigos Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Mis Amigos</h2>
              <Button
                variant="link"
                className="text-primary"
                onClick={() => router.push("/amigos")}
              >
                EXPLORAR →
              </Button>
            </div>
            <div className="space-y-6">
              {!isLoggedIn ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="mb-2">Inicia sesión para ver comentarios de tus amigos</p>
                  <Button variant="outline" onClick={() => router.push("/login")}>
                    Iniciar sesión
                  </Button>
                </div>
              ) : loadingFriends ? (
                <p className="text-center text-muted-foreground">Cargando comentarios de amigos...</p>
              ) : friendsComments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="mb-2">No hay comentarios de amigos disponibles</p>
                  <p className="text-sm mb-4">Conecta con otros usuarios para ver sus comentarios aquí</p>
                  <Button variant="outline" onClick={() => router.push("/amigos")}>
                    Explorar amigos
                  </Button>
                </div>
              ) : (
                friendsComments.map((comment) => (
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
                    onCommentDeleted={() => {
                      setFriendsComments(prev => prev.filter(c => c.id !== comment.id))
                    }}
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* Contenido Encuestas */}
      {activeTab === "encuestas" && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Encuestas</h2>
            <Button
              variant="link"
              className="text-primary"
              onClick={() => router.push("/community/encuestas")}
            >
              VER TODAS →
            </Button>
          </div>
          <div className="space-y-6">
            {loading ? (
              <p className="text-center text-muted-foreground">Cargando encuestas...</p>
            ) : encuestas.length > 0 ? (
              <div className="space-y-4">
                {encuestas.slice(0, 2).map((encuesta) => {
                  const { total, votes1, votes2, votes3, votes4 } = calculatePercentages(encuesta)
                  const userVoted = userVotes[encuesta.id]

                  // Log para depurar persistencia
                  console.debug(`[Render] Encuesta ${encuesta.id}: userVoted=${userVoted}, userVotes=`, userVotes)

                  return (
                    <div key={encuesta.id} className="bg-card p-6 rounded-lg border space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{encuesta.pregunta}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Activa</Badge>
                            {encuesta.fecha && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(encuesta.fecha).toLocaleDateString("es-ES")}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {total} {total === 1 ? 'voto' : 'votos'} total
                            </span>
                            {userVoted && (
                              <Badge variant="secondary">Puedes cambiar tu voto</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {renderVoteOption(encuesta, 1, encuesta.opcion1, votes1, calculatePercentages(encuesta).p1, total)}
                        {renderVoteOption(encuesta, 2, encuesta.opcion2, votes2, calculatePercentages(encuesta).p2, total)}
                        {renderVoteOption(encuesta, 3, encuesta.opcion3, votes3, calculatePercentages(encuesta).p3, total)}
                        {renderVoteOption(encuesta, 4, encuesta.opcion4, votes4, calculatePercentages(encuesta).p4, total)}
                      </div>

                      {!isLoggedIn && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground text-center">
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => router.push('/login')}
                            >
                              Inicia sesión
                            </Button>
                            {" "}para participar
                          </p>
                        </div>
                      )}

                      {votingLoading[encuesta.id] && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Votando...</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No hay encuestas activas</p>
                <p className="text-sm text-muted-foreground">
                  No hay encuestas disponibles en este momento
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
