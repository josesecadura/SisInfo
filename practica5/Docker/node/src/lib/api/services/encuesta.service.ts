import { apiClient } from "../client"
import { API_ENDPOINTS, API_CONFIG } from "../config"

export interface Encuesta {
    id: number
    idAdmin: number
    pregunta: string
    fecha?: string
    opcion1: string
    opcion2: string
    opcion3?: string
    opcion4?: string
    porcentaje1: number 
    porcentaje2: number
    porcentaje3: number 
    porcentaje4: number 
    activo: boolean
}

export interface CreateEncuestaDTO {
    idAdmin: number 
    pregunta: string
    fecha?: string
    opcion1: string
    opcion2: string
    opcion3?: string
    opcion4?: string
    activo?: boolean
}

export interface VoteEncuestaDTO {
    idUser: number
    idEncuesta: number
    opcionSeleccionada: number 
}

export interface VoteResponse {
    idUser: number
    idEncuesta: number
    opcionSeleccionada: number
    fechaVoto: string
}

export interface UpdateEncuestaDTO {
    id: number
    idAdmin?: number
    pregunta?: string
    fecha?: string 
    opcion1?: string
    opcion2?: string
    opcion3?: string
    opcion4?: string
    porcentaje1?: number
    porcentaje2?: number
    porcentaje3?: number
    porcentaje4?: number
    activo?: boolean
}

function unwrap<T>(res: any): T {
    if (!res) throw new Error("Sin respuesta del servidor")
    if (res.success === false) throw new Error(res.message || "Error API")
    
    // El apiClient devuelve { data: backendResponse, success: true }
    // donde backendResponse es { success: true, statusCode: 200, message: "...", data: [encuestas] }
    const backendResponse = res.data
    
    if (!backendResponse) throw new Error("No hay datos en la respuesta")
    if (backendResponse.success === false) throw new Error(backendResponse.message || "Error del backend")
    
    return backendResponse.data as T
}

export const encuestaService = {
    async getAll(): Promise<Encuesta[]> {
        try {
            const res = await apiClient.get(API_ENDPOINTS.encuestas.getAll)
            
            
            if (!res || res.success === false) {
                return []
            }
            
            const encuestas = unwrap<Encuesta[]>(res)
            
            // Combinar con contadores locales si existen
            const localVoteCounts = JSON.parse(localStorage.getItem('encuesta_vote_counts') || '{}')
            
            const encuestasConContadoresLocales = encuestas.map(encuesta => {
                const localCounts = localVoteCounts[encuesta.id]
                if (localCounts) {
                    return {
                        ...encuesta,
                        porcentaje1: encuesta.porcentaje1 + (localCounts.p1 || 0),
                        porcentaje2: encuesta.porcentaje2 + (localCounts.p2 || 0),
                        porcentaje3: encuesta.porcentaje3 + (localCounts.p3 || 0),
                        porcentaje4: encuesta.porcentaje4 + (localCounts.p4 || 0),
                    }
                }
                return encuesta
            })
            
            return encuestasConContadoresLocales
        } catch (e) {
            const msg = (e as Error).message || ""
            
            if (msg.includes("404") || msg.includes("status: 404")) {
                return []
            }
            
            throw new Error(`Error de conexión: ${msg}`)
        }
    },

    async getActive(): Promise<Encuesta[]> {
        try {
            const res = await apiClient.get(API_ENDPOINTS.encuestas.getActive)
            if (!res || res.success === false) {
                return []
            }
            
            const encuestas = unwrap<Encuesta[]>(res)
            
            return encuestas
        } catch (e) {
            const msg = (e as Error).message || ""
            
            if (msg.includes("404") || msg.includes("status: 404")) {
                return []
            }
            
            throw new Error(`Error de conexión: ${msg}`)
        }
    },

    async getById(id: number): Promise<Encuesta | null> {
    try {
        const res = await apiClient.get(API_ENDPOINTS.encuestas.getById(id))
        return unwrap<Encuesta>(res)
    } catch (e) {
        const msg = (e as Error).message || ""
        if (msg.includes("404")) return null
        throw e
    }
    },
    async create(payload: CreateEncuestaDTO): Promise<number> {
        // Preparar payload según el esquema del backend C#
        const backendPayload: CreateEncuestaDTO = {
            idAdmin: payload.idAdmin,
            pregunta: payload.pregunta,
            fecha: payload.fecha || new Date().toISOString(), // DateTime con UTC
            opcion1: payload.opcion1,
            opcion2: payload.opcion2,
            opcion3: payload.opcion3 || undefined,
            opcion4: payload.opcion4 || undefined,
            activo: payload.activo !== undefined ? payload.activo : true
            // Los porcentajes NO se envían, el backend los inicializa en 0
        } 
        const res = await apiClient.post(API_ENDPOINTS.encuestas.create, backendPayload)
        
        if (!res.success) {
            throw new Error(res.error || res.message || "Error al crear encuesta")
        }
        
        // El controlador retorna el ID de la encuesta creada
        return unwrap<number>(res)
    },
    async update(id: number, payload: UpdateEncuestaDTO): Promise<boolean> {
        
        // Preparar el payload con el formato correcto para el backend
        const backendPayload = {
            id: id,
            idAdmin: payload.idAdmin,
            pregunta: payload.pregunta,
            fecha: payload.fecha ? new Date(payload.fecha).toISOString() : new Date().toISOString(),
            opcion1: payload.opcion1 || "",
            opcion2: payload.opcion2 || "",
            opcion3: payload.opcion3 || "", // Enviar string vacío en lugar de null
            opcion4: payload.opcion4 || "", // Enviar string vacío en lugar de null
            porcentaje1: payload.porcentaje1 || 0,
            porcentaje2: payload.porcentaje2 || 0,
            porcentaje3: payload.porcentaje3 || 0,
            porcentaje4: payload.porcentaje4 || 0,
            activo: payload.activo !== undefined ? payload.activo : true
        }

        const res = await apiClient.put(API_ENDPOINTS.encuestas.update(id), backendPayload)

        if (!res.success) {
            throw new Error(res.error || res.message || "Error al actualizar encuesta")
        }
        
        const result = unwrap<boolean>(res)
        return result
    },
    async remove(id: number): Promise<boolean> {
    const res = await apiClient.delete(API_ENDPOINTS.encuestas.delete(id))
    return unwrap<boolean>(res)
    },

    async vote(payload: VoteEncuestaDTO): Promise<boolean> {
        try {
            // El endpoint espera query parameters en lugar de body JSON
            const endpoint = `${API_ENDPOINTS.encuestas.vote(payload.idEncuesta)}?idUser=${payload.idUser}&option=${payload.opcionSeleccionada}`
            
            const res = await apiClient.post(endpoint, {}) // Body vacío

            if (!res.success) {
                throw new Error(res.error || res.message || "Error al votar")
            }
            
            return unwrap<boolean>(res)
        } catch (e) {
            const errorMsg = (e as Error).message || ""
            
            // Manejar errores del backend (500, network errors, etc.)
            const isBackendError = errorMsg.includes("500") || 
                                    errorMsg.includes("HTTP error") || 
                                    errorMsg.includes("fetch") ||
                                    errorMsg.includes("Internal Server Error") ||
                                    errorMsg.includes("Network Error")
            
            if (isBackendError) {
                // Guardar voto en localStorage como fallback
                const existingVotes = JSON.parse(localStorage.getItem('encuesta_votes') || '{}')
                existingVotes[payload.idEncuesta] = payload.opcionSeleccionada
                localStorage.setItem('encuesta_votes', JSON.stringify(existingVotes))
                
                // También simular el incremento del contador de votos
                const encuestasVotes = JSON.parse(localStorage.getItem('encuesta_vote_counts') || '{}')
                if (!encuestasVotes[payload.idEncuesta]) {
                    encuestasVotes[payload.idEncuesta] = { p1: 0, p2: 0, p3: 0, p4: 0 }
                }
                
                // Decrementar voto anterior si existe
                const previousVotes = JSON.parse(localStorage.getItem('encuesta_votes') || '{}')
                const previousVote = previousVotes[payload.idEncuesta]
                if (previousVote && previousVote !== payload.opcionSeleccionada) {
                    encuestasVotes[payload.idEncuesta][`p${previousVote}`] = Math.max(0, encuestasVotes[payload.idEncuesta][`p${previousVote}`] - 1)
                }
                
                // Incrementar nuevo voto
                encuestasVotes[payload.idEncuesta][`p${payload.opcionSeleccionada}`] = (encuestasVotes[payload.idEncuesta][`p${payload.opcionSeleccionada}`] || 0) + 1
                
                localStorage.setItem('encuesta_vote_counts', JSON.stringify(encuestasVotes))
                
                // Lanzar error personalizado para indicar que se usó fallback
                throw new Error("Backend error - fallback usado")
            }
            
            throw e
        }
    },

    async getVote(encuestaId: number, userId: number): Promise<VoteResponse | null> {
        try {
            
            const endpoint = API_ENDPOINTS.encuestas.getVote(encuestaId, userId)
            
            const res = await apiClient.get(endpoint)
            
            
            // Intentar extraer la opción votada de diferentes estructuras posibles
            let voteOption = null
            
            // Estructura: {data: {success: true, data: 3}, success: true}
            if (res && res.data && typeof res.data === 'object') {
                const innerData = res.data
                
                if (innerData.success && typeof innerData.data === 'number') {
                    voteOption = innerData.data
                }
            }
            
            if (voteOption && typeof voteOption === 'number') {
                return {
                    idUser: userId,
                    idEncuesta: encuestaId,
                    opcionSeleccionada: voteOption,
                    fechaVoto: new Date().toISOString()
                }
            }
            
            return null
        } catch (e) {
            const msg = (e as Error).message || ""
            
            // 404 significa que el usuario no ha votado, eso es normal
            if (msg.includes("404") || msg.includes("Not Found")) {
                return null
            }
            
            // Para otros errores, intentar localStorage como fallback
            const existingVotes = JSON.parse(localStorage.getItem('encuesta_votes') || '{}')
            const userVote = existingVotes[encuestaId]
            
            if (userVote) {
                return {
                    idUser: userId,
                    idEncuesta: encuestaId,
                    opcionSeleccionada: userVote,
                    fechaVoto: new Date().toISOString()
                }
            }
            
            return null
        }
    },
}
