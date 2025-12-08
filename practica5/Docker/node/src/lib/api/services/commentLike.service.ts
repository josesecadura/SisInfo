import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface CreateComentarioLikeVO {
  idUser: number
  idComentario: number
}

export interface ComentarioLikeVO {
  idUser: number
  idComentario: number
  fecha: string
  username?: string
  usuario?: {
    id: number
    username: string
    fotoPerfil?: string
  }
}

export const commentLikeService = {
  async likeComment(idUser: number, idComentario: number): Promise<boolean> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.comentarioLikes.create, {
        idUser,
        idComentario
      })
      
      // El backend devuelve 201 si se creó exitosamente
      return response && (response as any).status !== 409
    } catch (error) {
      // Si es un error 409 (Conflict), significa que el like ya existe
      if ((error as any)?.response?.status === 409) {
        return false // Like ya existe
      }
      return false
    }
  },

  async unlikeComment(idUser: number, idComentario: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.comentarioLikes.delete(idUser, idComentario))
      return response && (response as any).status !== 404
    } catch (error) {
      return false
    }
  },

  async getLikes(idComentario: number): Promise<ComentarioLikeVO[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.comentarioLikes.getLikes(idComentario))
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? []
      return payload as ComentarioLikeVO[]
    } catch (error) {
      return []
    }
  },

  async checkUserLike(idUser: number, idComentario: number): Promise<boolean> {
    try {
      // Usar endpoint directo que devuelve ApiResponseBase con data: true/false
      const response = await apiClient.get(API_ENDPOINTS.comentarioLikes.checkUserLike(idUser, idComentario))
      
      // Tu backend devuelve ApiResponseBase.Ok(exists, message)
      // Estructura: { data: true/false, message: "...", isSuccess: true }
      const hasLike = (response as any)?.data?.data === true
      
      return hasLike
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return this.checkUserLikeFallback(idUser, idComentario)
      }
      return false
    }
  },

  async checkUserLikeFallback(idUser: number, idComentario: number): Promise<boolean> {
    try {
      const likes = await this.getLikes(idComentario)
      
      // Verificar si el usuario actual está en la lista de likes
      const hasLike = likes.some(like => {
        const likeUserId = Number(like.idUser)
        const currentUserId = Number(idUser)
        return likeUserId === currentUserId
      })
      
      return hasLike
    } catch (error) {
      return false
    }
  },

  // Obtener todos los comentarios que un usuario ha likeado
  async getUserLikedComments(userId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.comentarioLikes.getUserLikedComments(userId))
      
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = (response as any)?.data?.data ?? (response as any)?.data ?? []
      return Array.isArray(payload) ? payload : []
    } catch (error) {
      return []
    }
  },

  // Método optimizado para verificar múltiples comentarios de una vez
  async checkMultipleUserLikes(idUser: number, comentarioIds: number[]): Promise<Map<number, boolean>> {
    const result = new Map<number, boolean>()
    
    try {
      
      // Hacer todas las consultas en paralelo
      const promises = comentarioIds.map(async (comentarioId) => {
        const hasLike = await this.checkUserLike(idUser, comentarioId)
        return { comentarioId, hasLike }
      })
      
      const results = await Promise.all(promises)
      
      // Construir el mapa de resultados
      results.forEach(({ comentarioId, hasLike }) => {
        result.set(comentarioId, hasLike)
      })
      
      return result
    } catch (error) {
      // En caso de error, asumir que no hay likes
      comentarioIds.forEach(id => result.set(id, false))
      return result
    }
  }
}
