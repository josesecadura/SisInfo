"use client"

import { MovieCard } from "@/components/movie-card"
import { /* dialog removed - using dedicated movie page instead */ } from "@/components/ui/dialog"
import { ActorCard } from "@/components/actor-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Play, ArrowUp, List, BarChart3, Users } from "lucide-react"
import React, { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/client"
import { actorService } from "@/lib/api/services/actors.service"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const [friendsTab, setFriendsTab] = useState<"friends" | "survey">("friends")
  const [selectedSurveyOption, setSelectedSurveyOption] = useState<number | null>(null)

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
  
  const [newListName, setNewListName] = useState("")
  const router = useRouter()
  const [actors, setActors] = useState<any[]>([])
  const [isLogged, setIsLogged] = useState(false)
  const actorsRef = React.useRef<HTMLDivElement | null>(null)

  // Cargar películas desde la API al montar
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get<any>(`/api/Peliculas`)
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
  }, [])

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
  const genre2Movies = genre2 ? sourceMovies.filter((m) => (m.generos ?? []).includes(genre2)).slice(0, 10) : []

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

  const mockSurveys = [
    { option: "Spiderman", percentage: 50 },
    { option: "Superman", percentage: 15 },
    { option: "Batman", percentage: 20 },
    { option: "Thor", percentage: 15 },
  ]

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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">{latestMovie?.titulo ?? "Título película interesante"}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">{latestMovie?.descripcion ?? "Descripción de que va la película"}</p>
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

        {/* Misterio Section */}
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

        {/* Trailer Section */}
        <section className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <Play className="h-6 w-6 md:h-8 md:w-8 fill-current" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-balance">
              Próximo trailer de una película cualquiera
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
              Descripción del trailer y lo muy interesante que puede llegar a ser esta película y no te la puedes
              perder.
            </p>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Play className="h-4 w-4" />
              Ver el trailer
            </Button>
          </div>
        </section>

        {/* Friends and Survey Section */}
        <section className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Friends */}
          <div className="rounded-2xl bg-blue-950/50 border-2 border-blue-500/30 p-4 md:p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Amigos</h2>
            <div className="space-y-2 md:space-y-3">
              {mockFriends.map((friend) => (
                <Link
                  key={friend.id}
                  href={`/profile/${friend.id}`}
                  className="flex items-center gap-3 rounded-xl bg-blue-900/30 p-2 md:p-3 border border-blue-500/20 hover:bg-blue-900/50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted shrink-0" />
                  <p className="text-xs md:text-sm">{friend.user}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Survey */}
          <div className="rounded-2xl bg-purple-950/50 border-2 border-primary/30 p-4 md:p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Encuestas</h2>
            <div className="space-y-2 md:space-y-3">
              {mockSurveys.map((survey, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSurveyOption(i)}
                  className={`w-full flex items-center justify-between rounded-xl p-3 md:p-4 border transition-all ${
                    selectedSurveyOption === i
                      ? "bg-primary/40 border-primary"
                      : "bg-primary/20 border-primary/20 hover:bg-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                        selectedSurveyOption === i
                          ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-purple-950"
                          : "bg-primary/50"
                      }`}
                    />
                    <span className="text-sm md:text-base font-medium">{survey.option}</span>
                  </div>
                  <span className="text-sm md:text-base font-bold">{survey.percentage}%</span>
                </button>
              ))}
            </div>
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
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-xl bg-card border border-border p-6 md:p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <List className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Mis Listas</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Accede a tus listas desde aquí</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-6 md:p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <BarChart3 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Rankings</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Mira los top de cada tema</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-6 md:p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Comunidad</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Recibe aquí las reseñas más populares</p>
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
                    // Build image URL if TMDB profile_path is present
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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Product</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>Dashboard</li>
                <li>Apps & Integrations</li>
                <li>Developer Platform</li>
                <li>Miembro for iOS</li>
                <li>Enterprise</li>
                <li>Accessibility</li>
                <li>Changelog</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Customer Support</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>Contact</li>
                <li>Payments</li>
                <li>Redeem Code</li>
                <li>Educational & NPOs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Corporate</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Business</li>
                <li>Pricing</li>
                <li>Publications</li>
                <li>Investors</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Resources</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>What's New</li>
                <li>Blog</li>
                <li>Help Center</li>
                <li>Press</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              © 2025 Fylt · Terms of Service · Cookie Policy
            </p>
            <div className="flex gap-3 md:gap-4">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted" />
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted" />
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted" />
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted" />
            </div>
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
