// src/lib/api/services/actividad.service.ts

import { API_CONFIG } from "../config"

export interface CreateActividad {
    tipoActividad: string
    idUsuario?: number
    detalles?: string
}

export interface TrendData {
    etiqueta: string
    valor: number
}

// Interfaz para reflejar TODOS los datos del backend
export interface StatsDashboard {
    // Logins
    totalLoginsExitosos7Dias: number;
    totalLoginsFallidos7Dias: number;
    ratioLoginExito: number;

    // Usuarios
    totalNuevosUsuarios7Dias: number;

    // Contenido
    totalComentariosCreados7Dias: number;
    totalLikesComentarios7Dias: number;

    // Tendencias (solo datos para 7 días)
    tendenciaLoginsExitosos7Dias: TrendData[];
    tendenciaNuevosUsuarios7Dias: TrendData[];
}

// Apuntar siempre al backend real (Docker) usando baseURL
const API_BASE = `${API_CONFIG.baseURL}/Actividad`

const unwrap = <T>(json: any): T | null => {
    // Asumo que el backend devuelve un objeto ApiResponseBase: { data: { data: T } }
    const payload = json?.data?.data ?? json?.data ?? json
    return (payload ?? null) as T | null
}

export const ActividadService = {
    async registrarActividad(data: CreateActividad) {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        if (!res.ok) {
            const text = await res.text()
            console.error("Error registrando actividad", res.status, text)
        }
    },

    async getEstadisticasAdmin(days: 0 | 7): Promise<StatsDashboard | null> {
        const url = `${API_BASE}/estadisticas?days=${days}`; 

        const res = await fetch(url)
        if (!res.ok) {
            console.error("Error obteniendo estadísticas", res.status)
            return null
        }
        const json = await res.json()
        
        return unwrap<StatsDashboard>(json)
    }
}