"use client"

import { MovieCard } from "@/components/movie-card"
import { /* dialog removed - using dedicated movie page instead */ } from "@/components/ui/dialog"
import { ActorCard } from "@/components/actor-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, ArrowUp, List, BarChart3, Users } from "lucide-react"
import React, { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/client"
import { actorService } from "@/lib/api/services/actors.service"
import { movieService } from "@/lib/api/services/movie.service"
import { encuestaService, type Encuesta, type VoteEncuestaDTO } from "@/lib/api/services/encuesta.service"
import { usuarioSeguidorService, type UserSearchResult } from "@/lib/api/services/usuarioSeguidor.service"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from "@/hooks/use-toast"

export default function HomePage() {
  const [friendsTab, setFriendsTab] = useState<"friends" | "survey">("friends")
  const [selectedSurveyOption, setSelectedSurveyOption] = useState<number | null>(null)
  const [realEncuesta, setRealEncuesta] = useState<Encuesta | null>(null)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [friends, setFriends] = useState<UserSearchResult[]>([])
  const { user, isLoggedIn } = useCurrentUser()

  // Películas cargadas desde la API
  interface MovieFromApi {
    id: number
    titulo: string
    imagen?: string
    valoracion?: number
    generos?: string[]
    fecha?: string
    descripcion?: string
  }

  const [movies, setMovies] = useState<MovieFromApi[]>([])
  
  const router = useRouter()
  const [actors, setActors] = useState<any[]>([])
  const [isLogged, setIsLogged] = useState(false)
  const actorsRef = React.useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Estados para trailer aleatorio
  const [randomTrailer, setRandomTrailer] = useState<{movie: any, trailer: string | null}>({ movie: null, trailer: null })
  const [loadingTrailer, setLoadingTrailer] = useState(false)

  // Cargar películas desde la API al montar
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get<any>(`/Peliculas`)
        const payload = res?.data?.data ?? res?.data ?? []
        const mapped: MovieFromApi[] = Array.isArray(payload)
          ? payload.map((p: any) => ({
              id: p.id,
              titulo: p.titulo,
              imagen: p.imagen ?? "/placeholder.svg",
              valoracion: p.valoracion ?? 0,
              generos: Array.isArray(p.generos) ? p.generos : [],
              fecha: p.fecha,
              descripcion: p.descripcion,
            }))
          : []
        setMovies(mapped)
      } catch (err) {
        console.error("Error cargando películas:", err)
      }
    }

    // Detectar login básico (token en localStorage)
    try {
      setIsLogged(Boolean(localStorage.getItem("authToken")))
    } catch (e) {
      setIsLogged(false)
    }

    load()
    // mark mounted after initial load attempt so client-only changes don't break hydration
    setMounted(true)
  }, [])

  // Cargar trailer aleatorio
  const loadRandomTrailer = async () => {
    setLoadingTrailer(true)
    try {
      const randomMovie = await movieService.getRandomMovie()
      if (randomMovie) {
        try {
          const trailerRes = await movieService.getTrailer(randomMovie.id)
          const trailerUrl = (trailerRes as any)?.data?.data || (trailerRes as any)?.data || trailerRes || null
          setRandomTrailer({ movie: randomMovie, trailer: trailerUrl })
        } catch (e) {
          console.error("Error obteniendo trailer:", e)
          setRandomTrailer({ movie: randomMovie, trailer: null })
        }
      }
    } catch (e) {
      console.error("Error cargando trailer aleatorio:", e)
    } finally {
      setLoadingTrailer(false)
    }
  }

  // Cargar amigos
  const loadFriendsAndActivities = async () => {
    if (!isLoggedIn || !user?.id) return
    
    try {
      console.log("Cargando amigos para usuario:", user.id)
      const friendsData = await usuarioSeguidorService.getAmigos(Number(user.id))
      console.log("Amigos cargados:", friendsData.length)
      
      setFriends(friendsData)
    } catch (error) {
      console.error("Error cargando datos de amigos:", error)
    }
  }

  // Cargar encuesta real
  const loadRealEncuesta = async () => {
    try {
      const encuestasActivas = await encuestaService.getActive()
      if (encuestasActivas.length > 0) {
        const encuesta = encuestasActivas[0] // Primera encuesta activa
        setRealEncuesta(encuesta)
        
        // Si el usuario está autenticado, verificar si ya votó
        if (isLoggedIn && user?.id) {
          try {
            const voto = await encuestaService.getVote(encuesta.id, Number(user.id))
            if (voto && voto.opcionSeleccionada) {
              setUserVote(voto.opcionSeleccionada)
            }
          } catch (e) {
            // Usuario no ha votado, no es un error
          }
        }
      }
    } catch (e) {
      console.error("Error cargando encuesta:", e)
    }
  }

  // Función para votar
  const handleRealVote = async (opcion: number) => {
    if (!isLoggedIn || !user?.id || !realEncuesta) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para votar",
        variant: "destructive"
      })
      return
    }

    // Si ya votó la misma opción, no hacer nada
    if (userVote === opcion) {
      toast({
        title: "Ya votaste esta opción",
        description: "Ya tienes seleccionada esta opción"
      })
      return
    }

    try {
      const voteData: VoteEncuestaDTO = {
        idUser: Number(user.id),
        idEncuesta: realEncuesta.id,
        opcionSeleccionada: opcion
      }

      await encuestaService.vote(voteData)
      setUserVote(opcion)
      
      toast({
        title: "¡Voto registrado!",
        description: "Tu voto ha sido registrado correctamente"
      })
      
      // Recargar la encuesta para obtener datos actualizados
      await loadRealEncuesta()
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error al votar",
        description: "No se pudo registrar tu voto. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  // Cargar trailer aleatorio y encuesta al montar el componente
  useEffect(() => {
    loadRandomTrailer()
    loadRealEncuesta()
    loadFriendsAndActivities()
  }, [isLoggedIn, user?.id])

  // If API not ready, fall back to a small mocked list so UI doesn't break
  const mockMoviesFallback = Array(8)
    .fill(null)
    .map((_, i) => ({ id: i, titulo: `Película ${i + 1}`, imagen: "/placeholder.svg", valoracion: 50 + i, generos: ["Acción"], fecha: new Date().toISOString(), descripcion: `Descripción ${i + 1}` }))

  // Compute rows: popular = top by valoracion, then pick two genres
  const sourceMovies = movies.length ? movies : mockMoviesFallback
  const popular = [...sourceMovies].sort((a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0)).slice(0, 10)
  const genrePool: string[] = Array.from(new Set(sourceMovies.flatMap((m) => m.generos ?? [])))
  const genre1 = genrePool[0]
  const genre2 = genrePool[1] ?? genrePool[0]
  const genre1Movies = genre1 ? sourceMovies.filter((m) => (m.generos ?? []).includes(genre1)).slice(0, 10) : []

  // Latest movie by fecha
  const latestMovie = [...sourceMovies]
    .filter((m) => !!m.fecha)
    .sort((a, b) => new Date(b.fecha!).getTime() - new Date(a.fecha!).getTime())[0]

  // Refs para carruseles y helpers de scroll
  const popularRef = React.useRef<HTMLDivElement | null>(null)
  const genre1Ref = React.useRef<HTMLDivElement | null>(null)

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, amount: number) => {
    if (!ref.current) return
    ref.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  const openMovieDialog = (movie: MovieFromApi) => {
    // deprecated: use router.push to open movie page
    router.push(`/movie/${movie.id}`)
  }

  
  const mockFriends = [
    { id: 1, user: "¡Pepito ha añadido una película a una de sus listas!", avatar: "" },
    { id: 2, user: "Juan hizo una reseña de un titulo de una película", avatar: "" },
    { id: 3, user: "María puntuó la película más rara", avatar: "" },
    { id: 4, user: "¡Pepito ha añadido una película a una de sus listas!", avatar: "" },
  ]

  // Función para calcular porcentajes de la encuesta real
  const calculateRealPercentages = () => {
    if (!realEncuesta) return []
    
    const votes1 = realEncuesta.porcentaje1 || 0
    const votes2 = realEncuesta.porcentaje2 || 0
    const votes3 = realEncuesta.porcentaje3 || 0
    const votes4 = realEncuesta.porcentaje4 || 0
    
    const totalVotes = votes1 + votes2 + votes3 + votes4
    
    const options = []
    if (realEncuesta.opcion1) {
      options.push({
        option: realEncuesta.opcion1,
        percentage: totalVotes > 0 ? Math.round((votes1 / totalVotes) * 100) : 0,
        votes: votes1,
        opcionNum: 1
      })
    }
    if (realEncuesta.opcion2) {
      options.push({
        option: realEncuesta.opcion2,
        percentage: totalVotes > 0 ? Math.round((votes2 / totalVotes) * 100) : 0,
        votes: votes2,
        opcionNum: 2
      })
    }
    if (realEncuesta.opcion3) {
      options.push({
        option: realEncuesta.opcion3,
        percentage: totalVotes > 0 ? Math.round((votes3 / totalVotes) * 100) : 0,
        votes: votes3,
        opcionNum: 3
      })
    }
    if (realEncuesta.opcion4) {
      options.push({
        option: realEncuesta.opcion4,
        percentage: totalVotes > 0 ? Math.round((votes4 / totalVotes) * 100) : 0,
        votes: votes4,
        opcionNum: 4
      })
    }
    
    return options
  }
  const mockActors = [
    {
      name: "Will Smith",
      description:
        "Esta es una bonita descripción de un gran actor que nació en los Estados Unidos y que ha trabajado en la pobreza pero luego se volvió millonario por su gran trabajo.",
    },
    {
      name: "Will Smith",
      description:
        "Esta es una bonita descripción de un gran actor que nació en los Estados Unidos y que ha trabajado en la pobreza pero luego se volvió millonario por su gran trabajo.",
    },
    {
      name: "Will Smith",
      description:
        "Esta es una bonita descripción de un gran actor que nació en los Estados Unidos y que ha trabajado en la pobreza pero luego se volvió millonario por su gran trabajo.",
    },
  ]

  useEffect(() => {
    const loadActors = async () => {
      try {
        const res = await actorService.getPopulares()
        const anyRes = res as any
        const payload = anyRes?.data?.data ?? anyRes?.data ?? []
        setActors(Array.isArray(payload) ? payload : [])
      } catch (err) {
        console.error("Error cargando actores populares:", err)
      }
    }

    loadActors()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] mb-8 md:mb-12">
        {/* Background image (latest movie) */}
        {latestMovie ? (
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center rounded-2xl"
            style={{ backgroundImage: `url(${latestMovie.imagen})` }}
          />
        ) : (
          <div className="absolute inset-0 -z-20 bg-muted rounded-2xl" />
        )}

        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">{mounted && latestMovie ? latestMovie.titulo : "Películas destacadas"}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">{mounted && latestMovie ? latestMovie.descripcion : "Descubre las películas más interesantes."}</p>
          <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden mx-4 md:mx-8 mt-8" />
        </div>
      </section>

      {/* Movie Detail Dialog */}
      {/* Movie detail page handled on its own route: /movie/[id] */}

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-8 md:space-y-12 pb-20">
        {/* Tendencias Section */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Tendencias</h2>
            <Button variant="link" className="text-primary gap-2 text-sm md:text-base" onClick={() => (window.location.href = `/search`)}>
              VER MÁS <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <button
              aria-label="scroll-left"
              onClick={() => scroll(popularRef, -600)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-primary/90 text-white p-2 rounded-full shadow-lg hover:bg-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div ref={popularRef} className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {popular.map((movie) => (
                <MovieCard key={movie.id} id={movie.id} title={movie.titulo} imageUrl={movie.imagen} small onClick={() => openMovieDialog(movie)} />
              ))}
            </div>

            <button
              aria-label="scroll-right"
              onClick={() => scroll(popularRef, 600)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-primary/90 text-white p-2 rounded-full shadow-lg hover:bg-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">{genre1 ?? "Misterio"}</h2>
            <Button
              variant="link"
              className="text-primary gap-2 text-sm md:text-base"
              onClick={() => (window.location.href = `/search?genre=${encodeURIComponent(genre1 ?? "")}`)}
            >
              VER MÁS <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <button
              aria-label="scroll-left-genre"
              onClick={() => scroll(genre1Ref, -600)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-primary/90 text-white p-2 rounded-full shadow-lg hover:bg-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div ref={genre1Ref} className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {genre1Movies.map((movie) => (
                <MovieCard key={movie.id} id={movie.id} title={movie.titulo} imageUrl={movie.imagen} small onClick={() => openMovieDialog(movie)} />
              ))}
            </div>

            <button
              aria-label="scroll-right-genre"
              onClick={() => scroll(genre1Ref, 600)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-primary/90 text-white p-2 rounded-full shadow-lg hover:bg-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Trailer */}
        <section className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Video del trailer */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            {loadingTrailer ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-muted-foreground text-sm">Cargando trailer...</p>
                </div>
              </div>
            ) : randomTrailer.trailer ? (
              <iframe
                src={`https://www.youtube.com/embed/${randomTrailer.trailer}?autoplay=0&rel=0&modestbranding=1`}
                title={`Trailer de ${randomTrailer.movie?.titulo || randomTrailer.movie?.title || 'Película'}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center text-muted-foreground">
                  <p className="text-4xl mb-2">🎥</p>
                  <p className="text-sm">Trailer no disponible</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Información de la película */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-balance">
              {randomTrailer.movie ? (randomTrailer.movie.titulo || randomTrailer.movie.title) : "Próximo trailer de una película cualquiera"}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
              {randomTrailer.movie ? (randomTrailer.movie.descripcion || randomTrailer.movie.description || "Descripción no disponible") : "Descripción del trailer y lo muy interesante que puede llegar a ser esta película y no te la puedes perder."}
            </p>
            
            {/* Información adicional de la película */}
            {randomTrailer.movie && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {randomTrailer.movie.fecha && (
                  <span>📅 {new Date(randomTrailer.movie.fecha).getFullYear()}</span>
                )}
                {randomTrailer.movie.valoracion && randomTrailer.movie.valoracion > 0 ? (
                  <span>⭐ {randomTrailer.movie.valoracion}/10</span>
                ) : (
                  <span>⭐ N/A</span>
                )}
              </div>
            )}
            
            {/* Géneros */}
            {randomTrailer.movie?.generos && Array.isArray(randomTrailer.movie.generos) && (
              <div className="flex gap-2 flex-wrap mb-4">
                {randomTrailer.movie.generos.slice(0, 3).map((g: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-primary/10 rounded text-xs">{g}</span>
                ))}
              </div>
            )}
            
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={loadRandomTrailer}
              disabled={loadingTrailer}
            >
              <Play className="h-4 w-4" />
              {loadingTrailer ? "Cargando..." : "Nuevo Trailer"}
            </Button>
          </div>
        </section>

        {/* Friends and Survey Section */}
        <section className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Amigos y Actividades */}
          <div className="rounded-2xl bg-blue-950/50 border-2 border-blue-500/30 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Amigos
              </h2>
              <Button 
                variant="link" 
                className="text-blue-400 text-sm"
                onClick={() => router.push('/amigos')}
              >
                VER MÁS →
              </Button>
            </div>
            
            {isLoggedIn ? (
              friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.slice(0, 4).map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition-colors">
                      {/* Avatar del amigo */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-800 flex items-center justify-center">
                        {friend.fotoPerfil ? (
                          <img 
                            src={friend.fotoPerfil} 
                            alt={friend.username} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-blue-200">
                            {(friend.fullName || friend.username).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Info del amigo */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {friend.fullName || friend.username}
                        </p>
                        <p className="text-blue-300 text-xs">
                          @{friend.username}
                        </p>
                      </div>
                      
                      {/* Botón de acción */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs border-blue-500 text-blue-300 hover:bg-blue-800"
                        onClick={() => router.push(`/profile/${friend.id}`)}
                      >
                        Ver perfil
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-blue-300 py-6">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2 font-medium">Aún no sigues a nadie</p>
                  <p className="text-sm mb-4 opacity-80">Descubre personas con tus mismos gustos cinematográficos</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-500 text-blue-300 hover:bg-blue-800"
                    onClick={() => router.push('/amigos')}
                  >
                    Buscar amigos
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center text-blue-300 py-6">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">Conecta con otros amantes del cine</p>
                <p className="text-sm mb-4 opacity-80">Inicia sesión para seguir a tus amigos y ver sus actividades</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-500 text-blue-300 hover:bg-blue-800"
                  onClick={() => router.push('/login')}
                >
                  Iniciar sesión
                </Button>
              </div>
            )}
          </div>

          {/* Survey */}
          <div className="rounded-2xl bg-purple-950/50 border-2 border-primary/30 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">Encuestas</h2>
              <Button 
                variant="link" 
                className="text-primary text-sm"
                onClick={() => router.push('/community/encuestas')}
              >
                VER MÁS →
              </Button>
            </div>
            
            {realEncuesta ? (
              <>
                <h3 className="text-lg font-semibold mb-4 text-center">{realEncuesta.pregunta}</h3>
                <div className="space-y-2 md:space-y-3">
                  {calculateRealPercentages().map((survey) => (
                    <button
                      key={survey.opcionNum}
                      onClick={() => handleRealVote(survey.opcionNum)}
                      className={`w-full flex items-center justify-between rounded-xl p-3 md:p-4 border transition-all ${
                        userVote === survey.opcionNum
                          ? "bg-primary/40 border-primary"
                          : "bg-primary/20 border-primary/20 hover:bg-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                            userVote === survey.opcionNum
                              ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-purple-950"
                              : "bg-primary/50"
                          }`}
                        />
                        <span className="text-sm md:text-base font-medium">{survey.option}</span>
                        {userVote === survey.opcionNum && (
                          <span className="text-xs bg-primary/20 px-2 py-1 rounded">Tu voto</span>
                        )}
                      </div>
                      <span className="text-sm md:text-base font-bold">{survey.percentage}%</span>
                    </button>
                  ))}
                </div>
                {!isLoggedIn && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    <button 
                      onClick={() => router.push('/login')}
                      className="text-primary underline"
                    >
                      Inicia sesión
                    </button>
                    {" "}para participar
                  </p>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-2">No hay encuestas activas</p>
                <p className="text-sm">Las encuestas aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 md:mb-4">
            Tu espacio para el cine y las series
          </h2>
          <p className="text-sm md:text-base text-center text-muted-foreground mb-6 md:mb-8 px-4">
            Gestiona tus listas, descubre lo más popular y comparte tus opiniones con otros fans.
          </p>
          <div className="flex justify-center">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl w-full">
              <button 
                onClick={() => router.push('/profile')}
                className="rounded-xl bg-card border border-border p-6 md:p-8 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <List className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-bold mb-2">Mis Listas</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Accede a tus listas desde aquí</p>
              </button>
              {/* RANKING BOTON CENTRAL */}
              {/* <div className="rounded-xl bg-card border border-border p-6 md:p-8 text-center opacity-50 cursor-not-allowed">
                <BarChart3 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground" />
                <h3 className="text-lg md:text-xl font-bold mb-2 text-muted-foreground">Rankings</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Próximamente disponible</p>
              </div> */}
              <button 
                onClick={() => router.push('/community')}
                className="rounded-xl bg-card border border-border p-6 md:p-8 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
                <h3 className="text-lg md:text-xl font-bold mb-2">Comunidad</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Recibe aquí las reseñas más populares</p>
              </button>
            </div>
          </div>
        </section>

        {/* Actors Section */}
        <section className="bg-linear-to-b from-primary/10 to-transparent -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-8 md:py-12 rounded-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
            Actores más conocidos del mundo del cine
          </h2>
          <div className="relative max-w-6xl mx-auto">
            <button
              aria-label="scroll-actors-left"
              onClick={() => actorsRef.current && actorsRef.current.scrollBy({ left: -1700, behavior: "smooth" })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary/90 text-white p-2 rounded-full shadow-lg hover:bg-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div ref={actorsRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-8">
              {actors && actors.length > 0
                ? actors.slice(0, 15).map((actor: any) => {
                    // Cargar la imagen de los actores
                    const profilePath = actor.profile_path ?? actor.ProfilePath ?? actor.Profile_path
                    const imageUrl = profilePath ? `https://image.tmdb.org/t/p/w300${profilePath}` : (actor.Imagen ?? actor.imagen ?? actor.image)
                    return (
                      <ActorCard
                        key={actor.Id ?? actor.id ?? actor.IdActor ?? actor.nombre ?? actor.name}
                        name={actor.Nombre ?? actor.nombre ?? actor.name ?? "Actor"}
                        description={actor.Descripcion ?? actor.descripcion ?? "Actor popular"}
                        imageUrl={imageUrl}
                      />
                    )
                  })
                : mockActors.map((actor, i) => (
                    <ActorCard key={i} {...actor} />
                  ))}
            </div>

            <button
              aria-label="scroll-actors-right"
              onClick={() => actorsRef.current && actorsRef.current.scrollBy({ left: 1700, behavior: "smooth" })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary/90 text-white p-2 rounded-full shadow-lg hover:bg-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12 md:mt-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              © 2025 Fylt | Proyecto de la Sistemas de Información Universidad de Zaragoza
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Volver arriba"
      >
        <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
