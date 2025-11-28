    import { Badge } from "@/components/ui/badge"
    import { Button } from "@/components/ui/button"
    import { Card } from "@/components/ui/card"
    import { Switch } from "@/components/ui/switch"
    import { Pencil, Trash2 } from "lucide-react"
    import type { EncuestaUI } from "./types"

    interface EncuestaCardProps {
    encuesta: EncuestaUI
    isLoading: boolean
    onToggleStatus: (id: number) => void
    onEdit: (encuesta: EncuestaUI) => void
    onDelete: (id: number) => void
    }

    export function EncuestaCard({ 
    encuesta, 
    isLoading, 
    onToggleStatus, 
    onEdit, 
    onDelete 
    }: EncuestaCardProps) {
    return (
    <Card className="bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{encuesta.title}</h3>
            <div className="flex items-center gap-2">
            <Badge variant={encuesta.active ? "default" : "secondary"}>
                {encuesta.active ? "Activa" : "Inactiva"}
            </Badge>
            <span className="text-xs text-muted-foreground">
                {encuesta.createdAt.toLocaleDateString("es-ES")}
            </span>
            </div>
        </div>
        <Switch 
            checked={encuesta.active} 
            onCheckedChange={() => onToggleStatus(encuesta.id)} 
        />
        </div>

        {/* opciones con porcentajes */}
        <div className="space-y-2">
        {encuesta.options.map((opt, i) => {
            const porcentaje = i === 0 ? encuesta.porcentaje1 : 
                            i === 1 ? encuesta.porcentaje2 : 
                            i === 2 ? encuesta.porcentaje3 : 
                            encuesta.porcentaje4;
            return (
            <div key={i} className="w-full rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary flex justify-between items-center">
                <span>{opt}</span>
                <Badge variant="secondary" className="ml-2">
                {porcentaje || 0} votos
                </Badge>
            </div>
            )
        })}
        </div>

        {/* botones */}
        <div className="flex gap-2 pt-2">
        <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onEdit(encuesta)}
        >
            <Pencil className="h-4 w-4" /> Editar
        </Button>

        <Button
            variant="destructive"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => {
            if (confirm("¿Seguro que deseas eliminar esta encuesta?")) {
                onDelete(encuesta.id)
            }
            }}
            disabled={isLoading}
        >
            <Trash2 className="h-4 w-4" />
            {isLoading ? "..." : "Eliminar"}
        </Button>
        </div>
    </Card>
    )
}