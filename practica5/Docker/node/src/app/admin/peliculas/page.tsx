"use client"

import { useEffect, useState, useRef } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Plus, Pencil, Trash2, Download, Upload } from "lucide-react"
import { movieService } from "@/lib/api/services/movie.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Movie {
  // id usado internamente por la UI (único)
  id: number
  // id original/externo que usa la BD/backend (si está disponible)
  backendId?: number | string
  title: string
  image: string
  year: number
  genre: Array<string>
  description: string
}

export default function PeliculasPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMoviePage, setCurrentMoviePage] = useState(1)
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false)
  const [isEditMovieOpen, setIsEditMovieOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const router = useRouter()

  const itemsPerPage = 6

  const gridRef = useRef<HTMLDivElement | null>(null)

  const [movieForm, setMovieForm] = useState({
    title: "",
    image: "",
    year: new Date().getFullYear(),
    genre: "",
    description: "",
  })

  const normalizeGenres = (input: any): Array<string> => {
    if (!input) return []
    if (Array.isArray(input)) return input
    if (typeof input === "string") {
      return input
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0)
    }
    return [String(input)]
  }

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Verificar tamaño del archivo (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('La imagen debe ser menor a 5MB')
          return
        }
        
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64String = e.target?.result as string
          setImagePreview(base64String)
          setMovieForm({ ...movieForm, image: base64String })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

// 🔹 Mapea los campos del backend correctamente
const mapMovies = (data: any): Movie[] => {
  if (!Array.isArray(data)) {
    console.warn("⚠️Datos de películas no válidos:", data)
    return []
  }

  return data.map((m: any) => {
    const internalId = Number(m.id)

    const backendId =
      m.externalId !== undefined && m.externalId !== null
        ? Number(m.externalId)
        : undefined

    return {
      id: internalId,
      backendId,
      title: m.titulo ?? m.title ?? "",
      image: m.imagen ?? m.image ?? "/placeholder.svg",
      year: m.fecha ? new Date(m.fecha).getFullYear() : 0,
      genre: normalizeGenres(m.genero ?? m.generos ?? m.genre ?? []),
      description: m.descripcion ?? m.description ?? "",
    }
  })
}


const loadMovies = async () => {
  try {
    setLoading(true)
    const response = await movieService.getAll()
    console.log("loadMovies raw response:", response)

    // apiClient devuelve ApiResponse<T> con { data, success }
    // Algunos backends devuelven { data: { data: [...] } } o similar.
    let payload: any = undefined

    if (response == null) {
      payload = undefined
    } else if (Array.isArray(response)) {
      // improbable según ApiClient, pero por si acaso
      payload = response
    } else if ((response as any).data !== undefined) {
      payload = (response as any).data
    } else {
      payload = response
    }

    // Si el payload viene anidado: { data: [...] }
    if (payload && payload.data) payload = payload.data

    if (!payload) {
      console.warn("loadMovies: payload vacío", payload)
      setMovies([])
    } else if (!Array.isArray(payload)) {
      // Si payload es un objeto que contiene un array en alguna propiedad, extraerlo automáticamente
      const firstArrayProp = Object.keys(payload).find((k) => Array.isArray((payload as any)[k]))
      if (firstArrayProp) {
        console.log(`loadMovies: extrayendo array desde payload.${firstArrayProp}`)
        setMovies(mapMovies((payload as any)[firstArrayProp]))
      } else {
        console.warn("loadMovies: payload no es un array y no contiene arrays en sus propiedades:", payload)
        setMovies([])
      }
    } else {
      setMovies(mapMovies(payload))
    }
  } catch (err) {
    console.error("Error cargando películas:", err)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadMovies()
  }, [])

  // 🔹 Añadir manualmente (solo frontend)
  const handleAddMovie = async () => {
    try {
      const newMovie: Omit<Movie, "id"> = {
        title: movieForm.title,
        image: movieForm.image,
        year: movieForm.year,
        genre: normalizeGenres(movieForm.genre),
        description: movieForm.description,
      }

      await movieService.create({
        title: newMovie.title,
        image: newMovie.image,
        year: newMovie.year,
        genre: newMovie.genre,
        description: newMovie.description,
      })

      await loadMovies()
      setIsAddMovieOpen(false)
      setMovieForm({ title: "", image: "", year: new Date().getFullYear(), genre: "", description: "" })
    } catch (err) {
      console.error("Error al crear película:", err)
    }
  }

  // Editar película
  const handleEditMovie = async () => {
    if (!editingMovie) return
    try {
      const payload: any = {
        titulo: movieForm.title,
        id: editingMovie.id,
        externalId: typeof editingMovie.backendId === "number" && editingMovie.backendId !== editingMovie.id
                  ? editingMovie.backendId
                  : undefined,
        imagen: movieForm.image,
        fecha: movieForm.year
                        ? new Date(Date.UTC(Number(movieForm.year), 0, 1)).toISOString()
                        : undefined,
        descripcion: movieForm.description,
        generos: normalizeGenres(movieForm.genre),
      }
  console.log("genero=", payload.genero)

  // usar backendId si está disponible, sino fallback al id interno
  const targetId =  editingMovie.id 
  console.log("Updating movie targetId=", targetId, "payload=", payload)
  const res = await movieService.update(targetId as any, payload as any)
      console.log("Update response:", res)

      if (res?.success) {
        await loadMovies()
        setIsEditMovieOpen(false)
        setEditingMovie(null)
        // small user feedback
        try {
          // eslint-disable-next-line no-console
          console.log("Película actualizada correctamente")
        } catch {}
      } else {
        console.error("Error actualizando película:", res?.error ?? res)
        // mostrar alerta sencilla al usuario
        try {
          alert("No se pudo actualizar la película. Revisa la consola para más detalles.")
        } catch {}
      }
    } catch (err) {
      console.error("Error al editar película:", err)
    }
  }

  // Eliminar película
  const handleDeleteMovie = async (id: number) => {
    try {
      // buscar la película en el estado para obtener backendId si existe
      const movie = movies.find((m) => m.id === id)
      const targetId = movie?.backendId ?? id
      await movieService.delete(targetId as any)
      await loadMovies()
    } catch (err) {
      console.error("Error al eliminar película:", err)
    }
  }

  // Importar desde TMDB
  const handleImportMovies = async () => {
    try {
      setLoading(true)
      // Llamada al método genérico 'import' del servicio
      await movieService.import({ source: "tmdb" })
      await loadMovies()
    } catch (err) {
      console.error("Error al importar películas:", err)
    } finally {
      setLoading(false)
      setIsImportDialogOpen(false)
    }
  }

  const openEditDialog = (movie: Movie) => {
    setEditingMovie(movie)
    const genres = normalizeGenres(movie.genre)
    setMovieForm({
      title: movie.title,
      image: movie.image,
      year: movie.year,
      genre: genres.join(", "),
      description: movie.description,
    })
    setImagePreview(movie.image)
    setImageFile(null)
    setIsEditMovieOpen(true)
  }

  const handleCancelEdit = () => {
    setEditingMovie(null)
    setIsEditMovieOpen(false)
    setMovieForm({ title: "", image: "", year: new Date().getFullYear(), genre: "", description: "" })
    setImagePreview(null)
    setImageFile(null)
  }

  const filteredMovies = movies.filter((m) => m.title.toLowerCase().includes(searchTerm.trim().toLowerCase()))
  const totalMoviePages = Math.max(1, Math.ceil(filteredMovies.length / itemsPerPage))
  const currentMovies = filteredMovies.slice((currentMoviePage - 1) * itemsPerPage, currentMoviePage * itemsPerPage)

  useEffect(() => {
    // Si el filtro reduce el total de páginas, volver a la página 1
    if (currentMoviePage > totalMoviePages) {
      setCurrentMoviePage(1)
    }
  }, [searchTerm, totalMoviePages])

  const handlePageChange = (page: number) => {
    setCurrentMoviePage(page)
    // desplazar suavemente hacia la lista de películas
    // Con la de abajo nos da un salto lo quito porque me parece incomodo
    // ? REVISAR
    //setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader currentPage="peliculas" />
      <main className="container mx-auto px-6 py-12">
        {/* 🔹 Tabs de navegación (solo visual, redirigen entre páginas) */}
        <Tabs defaultValue="peliculas" className="mb-10">
          <TabsList className="flex w-full justify-center gap-4">
            <TabsTrigger
              value="peliculas"
              onClick={() => router.push("/admin/peliculas")}
            >
              Películas
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              onClick={() => router.push("/admin/reviews")}
            >
              Reseñas
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold">Gestión de Películas</h1>
          <p className="text-muted-foreground">
            Administra el catálogo de películas o impórtalas desde TMDB.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 items-center gap-4">
          <div className="flex items-center">
            <Input
              placeholder="Buscar películas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentMoviePage(1)
              }}
              aria-label="Buscar películas"
            />
          </div>

          <div className="flex justify-center">
            <Pagination currentPage={currentMoviePage} totalPages={totalMoviePages} onPageChange={handlePageChange} />
          </div>

          <div className="flex justify-end gap-2">
            {/* 🔹 Importar Películas */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Importar Películas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Películas</DialogTitle>
                  <DialogDescription>Importa películas desde TMDB</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportMovies}>Importar</Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Editar Película (diálogo global) */}
            <Dialog open={isEditMovieOpen} onOpenChange={setIsEditMovieOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Película</DialogTitle>
                  <DialogDescription>Modifica los datos de la película</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-image">Imagen</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-28 rounded overflow-hidden bg-muted">
                          {(imagePreview || movieForm.image) ? (
                            <Image 
                              src={imagePreview || movieForm.image} 
                              alt="Preview imagen" 
                              width={80} 
                              height={112} 
                              className="object-cover w-full h-full" 
                            />
                          ) : (
                            <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground text-center">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            onClick={handleImageUpload}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Subir imagen
                          </Button>
                          <Input
                            id="edit-image"
                            placeholder="O pega una URL de imagen"
                            value={movieForm.image.startsWith('data:') ? '' : movieForm.image}
                            onChange={(e) => {
                              setMovieForm({ ...movieForm, image: e.target.value })
                              setImagePreview(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tamaño máximo: 5MB. Formatos: JPG, PNG, WebP
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-year">Año</Label>
                      <Input
                        id="edit-year"
                        type="number"
                        value={movieForm.year}
                        onChange={(e) => setMovieForm({ ...movieForm, year: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-genre">Género</Label>
                      <Input
                        id="edit-genre"
                        value={movieForm.genre}
                        onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea
                      id="edit-description"
                      value={movieForm.description}
                      onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEditMovie}>Guardar Cambios</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Añadir Película Manualmente */}
            <Dialog open={isAddMovieOpen} onOpenChange={setIsAddMovieOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Añadir Película
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Añadir Nueva Película</DialogTitle>
                  <DialogDescription>Introduce los datos de la nueva película.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  />
                  <Label htmlFor="image">Imagen</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-28 rounded overflow-hidden bg-muted">
                        {(imagePreview || movieForm.image) ? (
                          <Image 
                            src={imagePreview || movieForm.image} 
                            alt="Preview imagen" 
                            width={80} 
                            height={112} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground text-center">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={handleImageUpload}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Subir imagen
                        </Button>
                        <Input
                          id="image"
                          placeholder="O pega una URL de imagen"
                          value={movieForm.image.startsWith('data:') ? '' : movieForm.image}
                          onChange={(e) => {
                            setMovieForm({ ...movieForm, image: e.target.value })
                            setImagePreview(e.target.value)
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tamaño máximo: 5MB. Formatos: JPG, PNG, WebP
                    </div>
                  </div>
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    type="number"
                    value={movieForm.year}
                    onChange={(e) => setMovieForm({ ...movieForm, year: parseInt(e.target.value) })}
                  />
                  <Label htmlFor="genre">Género</Label>
                  <Input
                    id="genre"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  />
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddMovieOpen(false)
                    setImagePreview(null)
                    setImageFile(null)
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddMovie}>Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de películas */}
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando películas...</p>
        ) : movies.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay películas disponibles.</p>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMovies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden">
                <div className="relative h-[300px] w-full bg-muted">
                  <Image src={movie.image || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-balance">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{movie.year}</Badge>
                      <Badge variant="outline">
                        {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openEditDialog(movie)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
