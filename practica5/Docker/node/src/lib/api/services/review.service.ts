import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface BackendComment {
  id: number
  idUser: number
  username: string
  imagenPelicula: string
  idPelicula: number
  descripcion: string
  numLikes: number
  visible?: boolean
  aprobado?: boolean | null
  fotoPerfil?: string | null
  likedByUser?: boolean
}

export type Review = BackendComment

export const reviewService = {
  async getAll(userId?: number) {
    try {
      let endpoint = API_ENDPOINTS.comentarios.getAll
      if (userId) {
        endpoint += `?userId=${userId}`
      }
      
      const res = await apiClient.get<any>(endpoint)
      // Si la petición no fue exitosa (p. ej. backend devolvió 404), apiClient devuelve { success: false }
      if (!res || (res as any).success === false) {
        // Devolver lista vacía cuando no hay datos o hay 404 del backend
        return [] as BackendComment[]
      }
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = res?.data?.data ?? res?.data ?? []
      return payload as BackendComment[]
    } catch (e) {
      return [] as BackendComment[]
    }
  },

  async getById(id: string | number) {
    const res = await apiClient.get<any>(API_ENDPOINTS.comentarios.getById(id))
    return res?.data?.data as BackendComment
  },

  async create(comment: Omit<BackendComment, "id">) {
    return apiClient.post(API_ENDPOINTS.comentarios.create, comment)
  },

  async update(id: string | number, comment: Partial<BackendComment>) {
    
    const body = { ...(comment as Record<string, any>), id: typeof id === "number" ? id : Number(id) }
    return apiClient.put(API_ENDPOINTS.comentarios.update(id), body)
  },

  async delete(id: string | number) {
    return apiClient.delete(API_ENDPOINTS.comentarios.delete(id))
  },
}
