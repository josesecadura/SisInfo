"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { MovieCard } from '@/components/movie-card'
import { listService, ListaVO } from '@/lib/api/services/list.service'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { useConfirmDialog } from '@/components/confirm-dialog'

interface Movie {
    id: number
    titulo: string
    imagen?: string
    generos?: string[]
    fecha?: string
    valoracion?: number
}

export default function ListaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params) // Unwrap la Promise con use()
  // Estados
    const [lista, setLista] = useState<ListaVO | null>(null)
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [editOpen, setEditOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [newImageFile, setNewImageFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    const { showConfirm, ConfirmComponent } = useConfirmDialog()

  // Cargar datos de la lista
    const loadLista = async () => {
        try {
        // Intentar obtener desde sessionStorage primero
            const storedList = sessionStorage.getItem("currentList")
            if (storedList) {
                const parsed = JSON.parse(storedList)
                setLista(parsed)
                setNewName(parsed.nombre || "")
            } else {
            // Fallback: cargar desde API
                const listaData = await listService.getById(id)
                if (listaData) {
                setLista(listaData)
                setNewName(listaData.nombre || "")
                }
            }
        } catch (error) {
            console.error("Error cargando lista:", error)
            setError("Error al cargar la lista")
        }
    }

  // Cargar películas de la lista
    const loadMovies = async () => {
        try {
            const res = await listService.getPeliculasByLista(id)
            const movies = Array.isArray(res) ? res : []

            const mappedMovies = movies.map((movie: any) => ({
                id: movie.id,
                titulo: movie.titulo || movie.title || "Sin título",
                imagen: movie.imagen || movie.image || "/placeholder.svg",
                generos: Array.isArray(movie.generos) ? movie.generos : [],
                fecha: movie.fecha,
                valoracion: movie.valoracion
            }))

            setMovies(mappedMovies)
        } catch (error) {
        console.error("Error cargando películas:", error)
        setError("Error al cargar las películas")
        }
    }

  // Eliminar película de la lista
    const handleRemoveMovie = async (peliculaId: number, titulo: string) => {
        showConfirm(
            `¿Estás seguro de eliminar "${titulo}" de la lista?`,
            async () => {
                try {
                    await listService.removePelicula(id, peliculaId)
                    setMovies(movies.filter(movie => movie.id !== peliculaId))
                } catch (error) {
                    console.error("Error eliminando película:", error)
                    alert("Error al eliminar la película")
                }
            },
            {
                title: "Eliminar película",
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                variant: "destructive"
            }
        )
    }

  // Actualizar lista (nombre e imagen)
    const handleUpdateList = async () => {
        if (!newName.trim() || !lista) return

        try {
            // Preparar URL de imagen
            let imageUrl = lista.imagen || "/icon_lista.png"
            if (newImageFile) {
                // Por ahora usar URL temporal - en producción se subiría al servidor
                imageUrl = URL.createObjectURL(newImageFile)
            }

            const payload = {
                id: lista.id,
                nombre: newName.trim(),
                imagen: imageUrl,
                descripcion: lista.descripcion
            }

            await listService.update(id, payload)
            // Actualizar estado local
            setLista({ ...lista, nombre: newName.trim(), imagen: imageUrl })
            
            // Actualizar sessionStorage si existe
            const storedList = sessionStorage.getItem("currentList")
            if (storedList) {
                const parsed = JSON.parse(storedList)
                sessionStorage.setItem("currentList", JSON.stringify({
                ...parsed,
                nombre: newName.trim(),
                imagen: imageUrl
                }))
            }
            
            setEditOpen(false)
            setNewImageFile(null)
        } catch (error) {
            console.error("Error actualizando lista:", error)
            alert("Error al actualizar el nombre")
        }
    }

  // Efectos
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            setError(null)
        
            await Promise.all([
                loadLista(),
                loadMovies()
            ])
            
            setLoading(false)
        }

        if (id) {
            loadData()
        }
    }, [id])

  // Estados de carga y error
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando lista...</p>
                </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
            </Button>
            </div>
        </div>
        )
    }

    if (!lista) {
        return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Lista no encontrada</h1>
            <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
            </Button>
            </div>
        </div>
        )
    }

    return (
        <>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header con navegación */}
        <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
            </Button>
            <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{lista.nombre}</h1>
            {lista.descripcion && (
                <p className="text-muted-foreground mt-2">{lista.descripcion}</p>
            )}
            </div>
            <Button
            variant="outline"
            onClick={() => {
                setNewName(lista.nombre || "")
                setNewImageFile(null)
                setEditOpen(true)
            }}
            >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar lista
            </Button>
        </div>

        {/* Dialog para editar lista */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Editar Lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
                <div>
                    <label className="text-sm font-medium">Nombre de la lista</label>
                    <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre de la lista"
                        className="mt-1"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Imagen de la lista</label>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('edit-list-file-input')?.click()}
                        >
                            📁 Seleccionar imagen
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {newImageFile ? newImageFile.name : "Ningún archivo seleccionado"}
                        </span>
                    </div>
                    <input 
                        id="edit-list-file-input"
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} 
                        className="hidden" 
                    />
                </div>
            </div>
            <DialogFooter>
                <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>
                    Cancelar
                </Button>
                    <Button
                    onClick={handleUpdateList}
                        disabled={!newName.trim()}
                            >
                            Guardar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Contenido de películas */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                Películas ({movies.length})
                </h2>
            </div>

            {movies.length === 0 ? (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                    Esta lista está vacía
                </p>
                <Button onClick={() => router.push("/")}>
                    Explorar películas
                </Button>
            </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {movies.map((movie) => (
                    <div key={movie.id} className="group">
                        <MovieCard 
                            id={movie.id} 
                            title={movie.titulo} 
                            imageUrl={movie.imagen} 
                        />
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMovie(movie.id, movie.titulo)}
                            className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                        </Button>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        
        <ConfirmComponent />
        </>
    )
}