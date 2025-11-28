import { apiClient } from "../client"
import { API_ENDPOINTS, API_CONFIG } from "../config"

// Interfaces basadas en el esquema real del backend C#
export interface Encuesta {
    id: number
    idAdmin: number // PascalCase como en el backend
    pregunta: string
    fecha?: string // DateTime? en el backend
    opcion1: string
    opcion2: string
    opcion3?: string
    opcion4?: string
    porcentaje1: number // Contador de votos
    porcentaje2: number // Contador de votos
    porcentaje3: number // Contador de votos
    porcentaje4: number // Contador de votos
    activo: boolean
}

export interface CreateEncuestaDTO {
    idAdmin: number // PascalCase como en el backend
    pregunta: string
    fecha?: string // DateTime? nullable en el backend
    opcion1: string
    opcion2: string
    opcion3?: string
    opcion4?: string
    activo?: boolean // Por defecto true en el backend
    // Los porcentajes no se envían, tienen valores por defecto en el backend
}

export interface VoteEncuestaDTO {
    idUser: number
    idEncuesta: number
    opcionSeleccionada: number // 1, 2, 3, o 4
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
    fecha?: string // DateTime en formato ISO 8601 (ej: "2025-11-21T22:12:51.553Z")
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
    
    // Las encuestas reales están en backendResponse.data
    return backendResponse.data as T
}

export const encuestaService = {
    async getAll(): Promise<Encuesta[]> {
        try {
            const res = await apiClient.get(API_ENDPOINTS.encuestas.getAll)
            
            console.log('[encuestaService.getAll] Respuesta completa:', res)
            
            if (!res || res.success === false) {
                console.log('No se encontraron encuestas en el servidor (respuesta no exitosa)')
                return []
            }
            
            const encuestas = unwrap<Encuesta[]>(res)
            console.log('[encuestaService.getAll] Encuestas después de unwrap:', encuestas)
            
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
            console.error('[encuestaService.getAll] Error:', msg)
            
            if (msg.includes("404") || msg.includes("status: 404")) {
                console.log('No se encontraron encuestas en el servidor (404)')
                return []
            }
            
            throw new Error(`Error de conexión: ${msg}`)
        }
    },

    async getActive(): Promise<Encuesta[]> {
        try {
            console.debug('[encuestaService.getActive] Obteniendo solo encuestas activas desde el backend')
            const res = await apiClient.get(API_ENDPOINTS.encuestas.getActive)
            
            console.log('[encuestaService.getActive] Respuesta completa:', res)
            
            if (!res || res.success === false) {
                console.log('No se encontraron encuestas activas en el servidor (respuesta no exitosa)')
                return []
            }
            
            const encuestas = unwrap<Encuesta[]>(res)
            console.log('[encuestaService.getActive] Encuestas activas después de unwrap:', encuestas)
            
            return encuestas
        } catch (e) {
            const msg = (e as Error).message || ""
            console.error('[encuestaService.getActive] Error:', msg)
            
            if (msg.includes("404") || msg.includes("status: 404")) {
                console.log('No se encontraron encuestas activas en el servidor (404)')
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
        
        console.debug('[encuestaService.create] Enviando payload:', backendPayload)
        
        const res = await apiClient.post(API_ENDPOINTS.encuestas.create, backendPayload)
        
        if (!res.success) {
            console.error('[encuestaService.create] Error del backend:', res)
            throw new Error(res.error || res.message || "Error al crear encuesta")
        }
        
        // El controlador retorna el ID de la encuesta creada
        return unwrap<number>(res)
    },
    async update(id: number, payload: UpdateEncuestaDTO): Promise<boolean> {
        console.debug('[encuestaService.update] Iniciando actualización de encuesta:', id)
        console.debug('[encuestaService.update] Payload recibido:', payload)
        console.debug('[encuestaService.update] Valor de activo:', payload.activo, typeof payload.activo)
        
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
        
        console.debug('[encuestaService.update] Payload enviado al backend:', backendPayload)
        console.debug('[encuestaService.update] Valor final de activo:', backendPayload.activo, typeof backendPayload.activo)
        console.debug('[encuestaService.update] Endpoint:', API_ENDPOINTS.encuestas.update(id))
        console.debug('[encuestaService.update] URL final:', `${API_CONFIG.baseURL}${API_ENDPOINTS.encuestas.update(id)}`)
        console.debug('[encuestaService.update] Método: PUT')
        
        const res = await apiClient.put(API_ENDPOINTS.encuestas.update(id), backendPayload)
        
        console.debug('[encuestaService.update] Respuesta del backend:', res)
        
        if (!res.success) {
            console.error('[encuestaService.update] Error del backend:', res)
            throw new Error(res.error || res.message || "Error al actualizar encuesta")
        }
        
        const result = unwrap<boolean>(res)
        console.debug('[encuestaService.update] Resultado final:', result)
        return result
    },
    async remove(id: number): Promise<boolean> {
    const res = await apiClient.delete(API_ENDPOINTS.encuestas.delete(id))
    return unwrap<boolean>(res)
    },

    async vote(payload: VoteEncuestaDTO): Promise<boolean> {
        try {
            console.debug('[encuestaService.vote] Enviando voto:', payload)
            
            // El endpoint espera query parameters en lugar de body JSON
            const endpoint = `${API_ENDPOINTS.encuestas.vote(payload.idEncuesta)}?idUser=${payload.idUser}&option=${payload.opcionSeleccionada}`
            
            console.debug('[encuestaService.vote] URL final:', endpoint)
            console.debug('[encuestaService.vote] IMPORTANTE: Este endpoint NO debe enviar porcentajes calculados, solo debe registrar el voto del usuario')
            
            const res = await apiClient.post(endpoint, {}) // Body vacío
            
            console.debug('[encuestaService.vote] Respuesta del backend:', res)
            console.debug('[encuestaService.vote] VERIFICAR: El backend debe incrementar el contador correspondiente (porcentaje1-4) internamente')
            
            if (!res.success) {
                console.error('[encuestaService.vote] Error del backend:', res)
                throw new Error(res.error || res.message || "Error al votar")
            }
            
            return unwrap<boolean>(res)
        } catch (e) {
            const errorMsg = (e as Error).message || ""
            console.error('[encuestaService.vote] Error completo:', e)
            
            // Manejar errores del backend (500, network errors, etc.)
            const isBackendError = errorMsg.includes("500") || 
                                 errorMsg.includes("HTTP error") || 
                                 errorMsg.includes("fetch") ||
                                 errorMsg.includes("Internal Server Error") ||
                                 errorMsg.includes("Network Error")
            
            if (isBackendError) {
                console.warn('[encuestaService.vote] Backend error detectado, usando localStorage como fallback')
                
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
            console.debug('[encuestaService.getVote] Obteniendo voto:', { encuestaId, userId })
            
            const endpoint = API_ENDPOINTS.encuestas.getVote(encuestaId, userId)
            console.debug('[encuestaService.getVote] URL del endpoint:', endpoint)
            
            const res = await apiClient.get(endpoint)
            
            console.debug('[encuestaService.getVote] Respuesta del backend:', res)
            
            // Intentar extraer la opción votada de diferentes estructuras posibles
            let voteOption = null
            
            // Estructura: {data: {success: true, data: 3}, success: true}
            if (res && res.data && typeof res.data === 'object') {
                const innerData = res.data
                console.debug('[encuestaService.getVote] Inner data:', innerData)
                
                if (innerData.success && typeof innerData.data === 'number') {
                    voteOption = innerData.data
                    console.debug('[encuestaService.getVote] Opción votada extraída:', voteOption)
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
            
            console.debug('[encuestaService.getVote] No se pudo extraer la opción votada, devolviendo null')
            return null
        } catch (e) {
            const msg = (e as Error).message || ""
            console.debug('[encuestaService.getVote] Error del backend (probablemente 404 - no ha votado):', msg)
            
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
