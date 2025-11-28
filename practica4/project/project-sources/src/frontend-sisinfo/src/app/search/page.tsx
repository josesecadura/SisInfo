"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MovieCard } from "@/components/movie-card"
import { apiClient } from "@/lib/api/client"

export default function SearchPage() {
  const params = useSearchParams()
  const initialGenre = params?.get("genre") ?? "all"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<string>("popular")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [availableGenres, setAvailableGenres] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get<any>(`/api/Peliculas`)
        const payload = res?.data?.data ?? res?.data ?? []
        const mapped = Array.isArray(payload)
          ? payload.map((p: any) => ({ id: p.id, titulo: p.titulo, imagen: p.imagen ?? "/placeholder.svg", generos: Array.isArray(p.generos) ? p.generos : [], fecha: p.fecha, valoracion: p.valoracion }))
          : []
        setMovies(mapped)
        const genres = Array.from(new Set(mapped.flatMap((m: any) => m.generos ?? [])))
        setAvailableGenres(genres)
        const years = Array.from(
          new Set(
            mapped
              .map((m: any) => (m.fecha ? new Date(m.fecha).getFullYear().toString() : undefined))
              .filter((y): y is string => !!y)
          )
        ).sort((a, b) => Number(b) - Number(a))
        setAvailableYears(years)
      } catch (err) {
        console.error("Error cargando películas en search:", err)
      }
    }

    load()
  }, [])

  // Derived filtered list
  const filtered = movies.filter((m) => {
    const matchesQuery = searchQuery ? m.titulo.toLowerCase().includes(searchQuery.toLowerCase()) : true
    const matchesGenre = selectedGenre && selectedGenre !== "all" ? (m.generos ?? []).includes(selectedGenre) : true
    const matchesYear = selectedYear && selectedYear !== "all" ? (m.fecha ? new Date(m.fecha).getFullYear().toString() === selectedYear : false) : true
    const matchesRating = selectedRating && selectedRating !== "all" ? (m.valoracion ?? 0) >= Number(selectedRating) : true
    return matchesQuery && matchesGenre && matchesYear && matchesRating
  })

  // Apply ordering
  const sorted = [...filtered].sort((a, b) => {
    if (selectedOrder === "popular") return (b.valoracion ?? 0) - (a.valoracion ?? 0)
    if (selectedOrder === "recent") return (new Date(b.fecha ?? 0).getTime() || 0) - (new Date(a.fecha ?? 0).getTime() || 0)
    if (selectedOrder === "title") return (a.titulo || "").localeCompare(b.titulo || "")
    return 0
  })

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      {/* Search Bar */}
      <div className="mb-6 md:mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por título"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 md:pl-12 h-10 md:h-12 text-base md:text-lg bg-card border-border"
          />
        </div>
      </div>

      {/* Filters Section (simple genre + placeholders) */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-bold">Filtros</h2>
          <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <Select onValueChange={(v) => setSelectedGenre(v)}>
            <SelectTrigger className="bg-card border-primary w-full">
              <SelectValue placeholder={selectedGenre && selectedGenre !== "all" ? selectedGenre : "Género"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableGenres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Other selects left as placeholders but present in UI */}
          <Select onValueChange={(v) => setSelectedYear(v)}>
            <SelectTrigger className="bg-card border-primary w-full">
              <SelectValue placeholder={selectedYear && selectedYear !== "all" ? selectedYear : "Año"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setSelectedRating(v)}>
            <SelectTrigger className="bg-card border-primary w-full">
              <SelectValue placeholder={selectedRating && selectedRating !== "all" ? `>= ${selectedRating}` : "Calificación"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="90">{">="} 90</SelectItem>
              <SelectItem value="80">{">="} 80</SelectItem>
              <SelectItem value="70">{">="} 70</SelectItem>
              <SelectItem value="60">{">="} 60</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setSelectedOrder(v)}>
            <SelectTrigger className="bg-card border-primary w-full">
              <SelectValue placeholder={selectedOrder || "Orden"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="recent">Reciente</SelectItem>
              <SelectItem value="title">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {sorted.map((movie) => (
          <MovieCard key={movie.id} id={movie.id} title={movie.titulo} imageUrl={movie.imagen} />
        ))}
      </div>
    </div>
  )
}
