"use client"

import { useState, useEffect } from "react"
import { AuthRequired } from "@/components/auth-required"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, ArrowLeft } from "lucide-react"
import { encuestaService, type Encuesta, type VoteEncuestaDTO } from "@/lib/api/services/encuesta.service"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function EncuestasPage() {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([])
  const [userVotes, setUserVotes] = useState<Record<number, number>>({})
  const [votingLoading, setVotingLoading] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  
  const { user, isLoggedIn } = useCurrentUser()
  const router = useRouter()

  // Cargar encuestas activas
  const loadEncuestas = async () => {
    try {
      const encuestasActivas = await encuestaService.getActive()
      
      setEncuestas(encuestasActivas)

      // Cargar votos del usuario si está autenticado
      if (isLoggedIn && user?.id) {
        await loadUserVotes(encuestasActivas.map(e => e.id))
      }
    } catch (error) {
      console.error("Error loading encuestas:", error)
      setEncuestas([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar votos del usuario
  const loadUserVotes = async (encuestaIds: number[]) => {
    if (!user?.id) {
      console.debug('[loadUserVotes] No hay usuario autenticado')
      return
    }

    console.debug('[loadUserVotes] Cargando votos para:', encuestaIds, 'usuario:', user.id)
    const votes: Record<number, number> = {}
    
    // Cargar votos en paralelo
    const votePromises = encuestaIds.map(async (encuestaId) => {
      try {
        console.debug(`[loadUserVotes] Verificando voto para encuesta ${encuestaId}...`)
        const voto = await encuestaService.getVote(encuestaId, Number(user.id))
        console.debug(`[loadUserVotes] Resultado para encuesta ${encuestaId}:`, voto)
        
        if (voto && voto.opcionSeleccionada) {
          votes[encuestaId] = voto.opcionSeleccionada
          console.debug(`[loadUserVotes] Usuario ya votó en encuesta ${encuestaId}, opción: ${voto.opcionSeleccionada}`)
        }
      } catch (error) {
        const errorMsg = (error as Error).message || ""
        if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
          console.debug(`[loadUserVotes] Usuario no ha votado en encuesta ${encuestaId} (404)`)
        } else {
          console.error(`[loadUserVotes] Error para encuesta ${encuestaId}:`, error)
        }
      }
    })

    await Promise.allSettled(votePromises)
    console.debug('[loadUserVotes] Votos finales:', votes)
    setUserVotes(votes)
  }

  // Votar en una encuesta
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

      await encuestaService.vote(voteData)

      // Actualizar estado local
      setUserVotes(prev => ({ ...prev, [encuestaId]: opcion }))

      toast({
        title: isChangingVote ? "¡Voto actualizado!" : "¡Voto registrado!",
        description: isChangingVote 
          ? "Has cambiado tu voto correctamente" 
          : "Tu voto ha sido registrado correctamente",
      })
    } catch (error) {
      console.error("Error voting:", error)
      const errorMsg = (error as Error).message || ""
      
      // Si el backend falló pero se usó localStorage como fallback
      if (errorMsg.includes("Backend error - fallback usado")) {
        // Actualizar el estado local de todas formas
        setUserVotes(prev => ({ ...prev, [encuestaId]: opcion }))
        
        toast({
          title: isChangingVote ? "¡Voto actualizado (offline)!" : "¡Voto registrado (offline)!",
          description: "Tu voto se ha guardado localmente debido a un problema del servidor.",
          variant: "destructive"
        })
      } else {
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

  // Renderizar opción de encuesta con diseño de admin (barras de progreso)
  const renderVoteOption = (
    encuesta: Encuesta,
    opcionNum: number,
    opcionTexto: string | undefined,
    votesCount: number,
    percentage: number,
    totalVotes: number
  ) => {
    if (!opcionTexto?.trim()) return null

    const userVoted = userVotes[encuesta.id]
    const isSelected = userVoted === opcionNum
    const canVote = isLoggedIn && !votingLoading[encuesta.id]

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

  useEffect(() => {
    loadEncuestas()
  }, [isLoggedIn, user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <AuthRequired>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold mb-2">Encuestas</h1>
        <p className="text-muted-foreground">
          Participa en las encuestas de la comunidad
        </p>
      </div>

      {encuestas.length > 0 ? (
        <div className="space-y-6">
          {encuestas.map((encuesta) => {
            const { total, votes1, votes2, votes3, votes4 } = calculatePercentages(encuesta)
            const userVoted = userVotes[encuesta.id]

            return (
              <Card key={encuesta.id} className="bg-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{encuesta.pregunta}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={encuesta.activo ? "default" : "secondary"}>
                        {encuesta.activo ? "Activa" : "Inactiva"}
                      </Badge>
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
                        <Badge variant="outline">Puedes cambiar tu voto</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opciones de votación */}
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
                      {" "}para participar en esta encuesta
                    </p>
                  </div>
                )}

                {votingLoading[encuesta.id] && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Registrando tu voto...</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No hay encuestas activas</h2>
          <p className="text-muted-foreground">
            No hay encuestas disponibles en este momento
          </p>
        </div>
      )}
      </div>
    </AuthRequired>
  )
}