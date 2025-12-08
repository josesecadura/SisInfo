"use client"
import { useEffect, useState } from "react"
import { AuthRequired } from "@/components/auth-required"
import { ActividadService, StatsDashboard, TrendData } from "@/lib/api/services/actividad.service"
import { useCurrentUser } from "@/hooks/use-current-user"
import { AdminHeader } from "@/components/admin-header" 
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"; // Necesario para los selectores
import { Separator } from "@/components/ui/separator"; // Necesario para la separación visual
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TrendingDown, Users, MessageSquare, ThumbsUp, UserPlus } from "lucide-react" 


// Definición del tipo de rango de tiempo para el estado
type TimeRange = 0 | 7;

// Extender la interfaz StatsDashboard
interface FullStatsDashboard extends StatsDashboard {
    totalLoginsExitosos7Dias: number;
    totalLoginsFallidos7Dias: number; 
    totalComentariosCreados7Dias: number;
    totalLikesComentarios7Dias: number;
    totalNuevosUsuarios7Dias: number;
    tendenciaLoginsExitosos7Dias: TrendData[];
    tendenciaNuevosUsuarios7Dias: TrendData[];
}


export default function EstadisticasAdminPage() {
    const [stats, setStats] = useState<FullStatsDashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState<TimeRange>(7); // Estado para 7 Días / Histórico
    const { user: currentUser } = useCurrentUser()
    
    const isAdmin = currentUser?.role === "admin";

    // Función de carga dinámica que depende del rango
    const cargarEstadisticas = (range: TimeRange) => {
        if (!isAdmin) return;

        setLoading(true);
        // Llama al servicio con el parámetro 'range' (0 o 7)
        ActividadService.getEstadisticasAdmin(range)
            .then(data => {
                setStats(data as FullStatsDashboard); 
            })
            .catch((err) => {
                console.error("Error al cargar estadísticas:", err);
                setError("No se pudieron cargar las estadísticas. Verifique la conexión API.");
            })
            .finally(() => setLoading(false))
    }

    // El useEffect recarga los datos cada vez que 'timeRange' cambia
    useEffect(() => {
        cargarEstadisticas(timeRange);
    }, [isAdmin, timeRange])


    // Manejo de estados y acceso denegado
    if (!isAdmin) {
        // ... (Acceso denegado JSX) ...
        return (
            <div className="min-h-screen bg-background">
                <AdminHeader currentPage="estadisticas" /> 
                <main className="container mx-auto px-6 py-12">
                    <h1 className="text-2xl font-bold mb-6">Acceso denegado</h1>
                    <p>Solo los administradores pueden ver esta sección.</p>
                </main>
            </div>
        )
    }

    if (loading) {
        // ... (Cargando JSX) ...
        return (
            <div className="min-h-screen bg-background">
                <AdminHeader currentPage="estadisticas" />
                <main className="container mx-auto px-6 py-12">
                    <h1 className="text-2xl font-bold mb-6">Panel de Estadísticas</h1>
                    <p>Cargando métricas clave...</p>
                </main>
            </div>
        )
    }

    if (error || !stats) {
        // ... (Error JSX) ...
        return (
            <div className="min-h-screen bg-background">
                <AdminHeader currentPage="estadisticas" />
                <main className="container mx-auto px-6 py-12 text-red-500">
                    <h1 className="text-2xl font-bold mb-6">Error de Carga</h1>
                    <p>{error || "No se recibieron datos válidos del servidor."}</p>
                </main>
            </div>
        )
    }

    const periodoActual = timeRange === 7 ? "Últimos 7 Días" : "Historial Completo";

    // ======================================================================
    // 2. RENDERIZADO DE DATOS CON SELECTOR
    // ======================================================================
    return (
        <AuthRequired requireAdmin={true}>
          <div className="min-h-screen bg-background">
              <AdminHeader currentPage="estadisticas" /> 

              <main className="container mx-auto px-6 py-12">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-3xl font-bold">Panel de Estadísticas</h1>
                </div>
                
                {/* === SELECTOR DE TIEMPO === */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-lg font-medium">
                        Periodo de Análisis: 
                        <span className="font-extrabold text-indigo-600 ml-2">{periodoActual}</span>
                    </p>
                    <div className="flex gap-2 p-1 border rounded-md bg-muted/50">
                        <Button
                            variant={timeRange === 7 ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setTimeRange(7)} // Actualiza el estado a 7
                        >
                            7 Días
                        </Button>
                        <Button
                            variant={timeRange === 0 ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setTimeRange(0)} // Actualiza el estado a 0
                        >
                            Histórico
                        </Button>
                    </div>
                </div>
                <Separator className="mb-8" />
                
                {/* === KPIs Principales === */}
                <h2 className="text-xl font-bold mb-4">Resumen de Actividad ({periodoActual})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    
                    {/* Card 1: Logins Exitosos */}
                    <Card className="shadow-md hover:shadow-lg transition">
                        <div className="p-4 flex flex-col justify-between h-full">
                            <Users className="h-6 w-6 text-green-600 mb-2" />
                            <div className="text-sm font-medium text-muted-foreground">Logins Exitosos</div>
                            <div className="text-3xl font-bold text-green-600">{stats.totalLoginsExitosos7Dias}</div>
                        </div>
                    </Card>

                    {/* Card 2: Logins Fallidos */}
                    <Card className="shadow-md hover:shadow-lg transition">
                        <div className="p-4 flex flex-col justify-between h-full">
                            <TrendingDown className="h-6 w-6 text-red-600 mb-2" />
                            <div className="text-sm font-medium text-muted-foreground">Logins Fallidos</div>
                            <div className="text-3xl font-bold text-red-600">{stats.totalLoginsFallidos7Dias}</div> 
                        </div>
                    </Card>

                    {/* Card 3: Nuevos Usuarios */}
                    <Card className="shadow-md hover:shadow-lg transition">
                        <div className="p-4 flex flex-col justify-between h-full">
                            <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
                            <div className="text-sm font-medium text-muted-foreground">Nuevos Usuarios</div>
                            <div className="text-3xl font-bold text-blue-600">{stats.totalNuevosUsuarios7Dias}</div> 
                        </div>
                    </Card>

                    {/* Card 4: Comentarios Creados */}
                    <Card className="shadow-md hover:shadow-lg transition">
                        <div className="p-4 flex flex-col justify-between h-full">
                            <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
                            <div className="text-sm font-medium text-muted-foreground">Comentarios Creados</div>
                            <div className="text-3xl font-bold text-purple-600">{stats.totalComentariosCreados7Dias}</div> 
                        </div>
                    </Card>
                    
                    {/* Card 5: Likes en Comentarios */}
                    <Card className="shadow-md hover:shadow-lg transition">
                        <div className="p-4 flex flex-col justify-between h-full">
                            <ThumbsUp className="h-6 w-6 text-pink-600 mb-2" />
                            <div className="text-sm font-medium text-muted-foreground">Likes Recibidos</div>
                            <div className="text-3xl font-bold text-pink-600">{stats.totalLikesComentarios7Dias}</div> 
                        </div>
                    </Card>
                </div>

                <div className="mb-12">
                    <Card className="shadow-md p-4 max-w-sm mx-auto text-center">
                        <div className="text-lg font-medium text-muted-foreground mb-1">Éxito de Login</div>
                        <div className="text-4xl font-extrabold text-indigo-600">{(stats.ratioLoginExito * 100).toFixed(2)}%</div>
                    </Card>
                </div>


                {/* === Tablas de Tendencia (Solo visibles en modo 7 Días) === */}
                {timeRange === 7 && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Tendencias Diarias (Últimos 7 Días)</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Tabla 1: Logins Exitosos por Día */}
                            <Card className="p-0 overflow-hidden shadow-lg">
                                <h3 className="text-lg font-semibold p-4 border-b">Logins Exitosos</h3>
                                <TableTrend data={stats.tendenciaLoginsExitosos7Dias} metricName="Logins" />
                            </Card>

                            {/* Tabla 2: Nuevos Usuarios por Día */}
                            <Card className="p-0 overflow-hidden shadow-lg">
                                <h3 className="text-lg font-semibold p-4 border-b">Nuevos Usuarios</h3>
                                <TableTrend data={stats.tendenciaNuevosUsuarios7Dias} metricName="Usuarios" />
                            </Card>
                        </div>
                    </>
                )}
                {/* Mensaje para el modo Histórico */}
                {timeRange === 0 && (
                    <div className="p-4 text-center text-muted-foreground border rounded-md">
                        Las tablas de tendencia por día solo están disponibles en el modo "7 Días".
                    </div>
                )}
            </main>
          </div>
        </AuthRequired>
    )
}

interface TableTrendProps {
    data: TrendData[];
    metricName: string;
}

const TableTrend: React.FC<TableTrendProps> = ({ data, metricName }) => {
    if (data.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No hay datos de {metricName.toLowerCase()} en los últimos 7 días.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">{metricName}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item, idx) => (
                    <TableRow key={idx}>
                        <TableCell className="font-medium">{item.etiqueta}</TableCell>
                        <TableCell className="text-right font-bold">{item.valor}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};