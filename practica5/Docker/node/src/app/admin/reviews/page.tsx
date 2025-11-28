"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Trash2 } from "lucide-react"
import Image from "next/image"
import { apiClient } from "@/lib/api/client"
import { reviewService } from "@/lib/api/services/review.service"
import { userService } from "@/lib/api"

interface Review {
    id: number
    user: string
    movieTitle: string
    movieImage: string
    review: string
    status: "pending" | "approved" | "rejected"
}

export default function ReviewsPage() {
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const reviewsPerPage = 6
    const router = useRouter()

    // Clase compartida para los botones de acción (mismo tamaño)
    const actionBtnClass =
    "w-[130px] h-[36px] flex items-center justify-center gap-1 text-sm font-medium transition-all";

  // Estado inicial con ejemplos locales
    const [reviews, setReviews] = useState<Review[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const payload = await reviewService.getAll()

            // Para cada comentario, traemos los datos de la película (solo los que existan en BD)
                const moviePromises = payload.map(async (c) => {      
                    const userRes = await userService.getById(c.idUser)
                    const userData = userRes.data?.fullName || userRes.data?.username || null
                    try {
                        const movieRes = await apiClient.get<any>(`/Peliculas/${c.idPelicula}`)
                        const movieData = movieRes?.data?.data ?? null
                        return {
                            ...c,
                            movieTitle: movieData?.titulo ?? `Película #${c.idPelicula}`,
                            movieImage: movieData?.imagen ?? "/placeholder.svg",
                        }
                    } catch {
                        return {
                        ...c,
                        userName: userData || `Usuario #${c.idUser}`,
                        movieTitle: `Película #${c.idPelicula}`,
                        movieImage: "/placeholder.svg",
                        }
                    }
                })

                const detailed = await Promise.all(moviePromises)

                const mapped: Review[] = detailed.map((c) => ({
                    id: c.id,
                    user: c.username,
                    movieTitle: c.movieTitle,
                    movieImage: c.movieImage,
                    review: c.descripcion,
                    status: c.aprobado === true ? "approved" : c.aprobado === false ? "rejected" : "pending",
                }))

                setReviews((prev) => {
                    const existingIds = new Set(prev.map((r) => r.id))
                    const newOnes = mapped.filter((m) => !existingIds.has(m.id))
                    return [...newOnes, ...prev]
                })
            } catch (err) {
                console.error("Error cargando comentarios:", err)
            }
        }

        load()
    }, [])

    const filteredReviews = filterStatus === "all" ? reviews : reviews.filter((r) => r.status === filterStatus)
    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage))
    const currentReviews = filteredReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage)

    const handleApprove = async (id: number) => {
        try {
            await reviewService.update(id, { visible: true, aprobado: true })
            setReviews((r) => r.map((rev) => (rev.id === id ? { ...rev, status: "approved" } : rev)))
        } catch (err) {
            console.error("Error aprobando comentario:", err)
        }
    }

    const handleReject = async (id: number) => {
        try {
            await reviewService.update(id, { visible: false, aprobado: false })
            setReviews((r) => r.map((rev) => (rev.id === id ? { ...rev, status: "rejected" } : rev)))
        } catch (err) {
            console.error("Error rechazando comentario:", err)
        }
    }

    const handleReset = async (id: number) => {
        try {
            await reviewService.update(id, { visible: false, aprobado: null })
            setReviews((r) => r.map((rev) => (rev.id === id ? { ...rev, status: "pending" } : rev)))
        } catch (err) {
        console.error("Error restableciendo comentario:", err)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await reviewService.delete(id)
            setReviews((r) => r.filter((rev) => rev.id !== id))
        } catch (err) {
        console.error("Error eliminando comentario:", err)
        }
    }

    return (
        <div className="min-h-screen bg-background">
        <AdminHeader currentPage="reviews" />

        <main className="container mx-auto px-6 py-12">
            <Tabs defaultValue="reviews" className="mb-10">
            <TabsList className="flex w-full justify-center gap-4">
                <TabsTrigger value="peliculas" onClick={() => router.push("/admin/peliculas")}>
                Películas
                </TabsTrigger>
                <TabsTrigger value="reviews" onClick={() => router.push("/admin/reviews")}>
                Reseñas
                </TabsTrigger>
            </TabsList>
            </Tabs>

            <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-balance">Gestión de Reseñas</h1>
            <p className="text-muted-foreground text-pretty">Modera las reseñas de los usuarios sobre las películas.</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((status) => (
                <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status as any)}>
                    {{ all: "Todas", pending: "Pendientes", approved: "Aprobadas", rejected: "Rechazadas" }[status]}
                </Button>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            <div className="space-y-4">
            {currentReviews.map((review) => (
                <Card key={review.id} className="border-2 border-primary/50 bg-card p-6">
                <div className="flex gap-6">
                    <div className="relative h-[120px] w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={review.movieImage || "/placeholder.svg"} alt={review.movieTitle} fill priority className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <span className="text-xs font-medium">{review.user[0]}</span>
                        </div>
                        <span className="font-medium">{review.user}</span>
                        <Badge variant={review.status === "approved" ? "default" : review.status === "rejected" ? "destructive" : "secondary"}>
                        {review.status === "approved" ? "Aprobada" : review.status === "rejected" ? "Rechazada" : "Pendiente"}
                        </Badge>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground">{review.movieTitle}</p>
                    <p className="text-sm leading-relaxed">{review.review}</p>
                    </div>

                    <div className="flex flex-col gap-2 justify-center">
                    {review.status === "pending" ? (
                        <>
                <Button variant="outline" size="sm" onClick={() => handleApprove(review.id)} className={`${actionBtnClass} border-green-500 text-green-600 hover:bg-green-500 hover:text-white`}>
                            <Check className="h-4 w-4" /> Aceptar
                        </Button>
                <Button variant="outline" size="sm" onClick={() => handleReject(review.id)} className={`${actionBtnClass} border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white`}>
                            <X className="h-4 w-4" /> Rechazar
                        </Button>
                        </>
                    ) : (
                        <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReset(review.id)}
                className={`${actionBtnClass} border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white`}
                        >
                            Revisar de nuevo
                        </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(review.id)} className={actionBtnClass}>
                            <Trash2 className="h-4 w-4" /> Eliminar
                        </Button>
                        </>
                    )}
                    </div>
                </div>
                </Card>
            ))}
            </div>
        </main>
        </div>
    )
}
