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
      console.log(`Intentando dar like - Usuario: ${idUser}, Comentario: ${idComentario}`)
      const response = await apiClient.post(API_ENDPOINTS.comentarioLikes.create, {
        idUser,
        idComentario
      })
      
      console.log('Respuesta del like:', response)
      // El backend devuelve 201 si se creó exitosamente
      return response && (response as any).status !== 409
    } catch (error) {
      console.error("Error al dar like al comentario:", error)
      // Si es un error 409 (Conflict), significa que el like ya existe
      if ((error as any)?.response?.status === 409) {
        console.log("Like ya existe (409)")
        return false // Like ya existe
      }
      return false
    }
  },

  async unlikeComment(idUser: number, idComentario: number): Promise<boolean> {
    try {
      console.log(`Intentando quitar like - Usuario: ${idUser}, Comentario: ${idComentario}`)
      const response = await apiClient.delete(API_ENDPOINTS.comentarioLikes.delete(idUser, idComentario))
      console.log('Respuesta del unlike:', response)
      return response && (response as any).status !== 404
    } catch (error) {
      console.error("Error al quitar like del comentario:", error)
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
      console.error("Error al obtener likes del comentario:", error)
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
      
      console.log(`Usuario ${idUser} ${hasLike ? 'SÍ' : 'NO'} tiene like en comentario ${idComentario} (endpoint directo)`)
      return hasLike
    } catch (error) {
      // Si el endpoint no existe (404), usar el método anterior como fallback
      if ((error as any)?.response?.status === 404) {
        console.log("Endpoint directo no disponible, usando método fallback...")
        return this.checkUserLikeFallback(idUser, idComentario)
      }
      console.error("Error al verificar like del usuario:", error)
      return false
    }
  },

  // Método fallback (el anterior) por si el endpoint directo no está implementado
  async checkUserLikeFallback(idUser: number, idComentario: number): Promise<boolean> {
    try {
      console.log(`Verificando like (fallback) - Usuario: ${idUser}, Comentario: ${idComentario}`)
      const likes = await this.getLikes(idComentario)
      console.log(`Likes encontrados para comentario ${idComentario}:`, likes)
      
      // Verificar si el usuario actual está en la lista de likes
      const hasLike = likes.some(like => {
        const likeUserId = Number(like.idUser)
        const currentUserId = Number(idUser)
        return likeUserId === currentUserId
      })
      
      console.log(`Usuario ${idUser} ${hasLike ? 'SÍ' : 'NO'} tiene like en comentario ${idComentario}`)
      return hasLike
    } catch (error) {
      console.error("Error al verificar like del usuario (fallback):", error)
      return false
    }
  },

  // Obtener todos los comentarios que un usuario ha likeado
  async getUserLikedComments(userId: number): Promise<any[]> {
    try {
      console.log(`Obteniendo comentarios likeados por usuario ${userId}`)
      const response = await apiClient.get(API_ENDPOINTS.comentarioLikes.getUserLikedComments(userId))
      
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = (response as any)?.data?.data ?? (response as any)?.data ?? []
      console.log(`Encontrados ${Array.isArray(payload) ? payload.length : 0} comentarios likeados`)
      return Array.isArray(payload) ? payload : []
    } catch (error) {
      console.error("Error al obtener comentarios likeados del usuario:", error)
      return []
    }
  },

  // Método optimizado para verificar múltiples comentarios de una vez
  async checkMultipleUserLikes(idUser: number, comentarioIds: number[]): Promise<Map<number, boolean>> {
    const result = new Map<number, boolean>()
    
    try {
      console.log(`Verificando likes para usuario ${idUser} en ${comentarioIds.length} comentarios`)
      
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
      
      console.log('Resultados de verificación de likes:', Object.fromEntries(result))
      return result
    } catch (error) {
      console.error('Error verificando múltiples likes:', error)
      // En caso de error, asumir que no hay likes
      comentarioIds.forEach(id => result.set(id, false))
      return result
    }
  }
}
