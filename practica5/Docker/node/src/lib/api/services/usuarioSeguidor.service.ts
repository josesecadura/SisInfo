import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface FollowVO {
  IdUser: number
  IdAmigo: number
}

export interface CreateFollowVO {
  IdUser: number
  IdAmigo: number
}

export interface UserSearchResult {
  id: number
  username: string
  email?: string
  fullName?: string
  fotoPerfil?: string | null
  seguidores?: number
  seguidos?: number
  isFollowing?: boolean
  boolAdmin?: boolean
  role?: string
}

export const usuarioSeguidorService = {
  async buscar(username: string): Promise<UserSearchResult[]> {
    try {
      console.log(`Buscando usuarios con username: ${username}`)
      const res = await apiClient.get<any>(API_ENDPOINTS.usuarioSeguidor.buscar(username))
      
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = res?.data?.data ?? res?.data ?? []
      console.log('Usuarios encontrados:', payload)
      return payload as UserSearchResult[]
    } catch (error) {
      console.error("Error al buscar usuarios:", error)
      // Si es 404, significa que no se encontraron usuarios
      if ((error as any)?.response?.status === 404) {
        return []
      }
      return []
    }
  },

  async seguir(idUser: number, idAmigo: number): Promise<boolean> {
    try {
      // Usar el formato correcto según los VOs del backend
      const payload: FollowVO = {
        IdUser: idUser,
        IdAmigo: idAmigo
      }
      
      console.log(`Usuario ${idUser} intentando seguir a usuario ${idAmigo}`)
      console.log('Payload enviado al backend:', payload)
      console.log('URL endpoint:', API_ENDPOINTS.usuarioSeguidor.seguir)
      
      const response = await apiClient.post(API_ENDPOINTS.usuarioSeguidor.seguir, payload)
      
      console.log('Respuesta del seguir:', response)
      return response && (response as any).status !== 409
    } catch (error) {
      console.error("Error al seguir usuario:", error)
      console.error("Error completo:", JSON.stringify(error, null, 2))
      
      // Si es un error 409 (Conflict), significa que ya lo sigue
      if ((error as any)?.response?.status === 409) {
        console.log("Ya sigue a este usuario (409)")
        return false
      }
      return false
    }
  },

  async unfollow(idUser: number, idAmigo: number): Promise<boolean> {
    try {
      console.log(`Usuario ${idUser} intentando dejar de seguir a usuario ${idAmigo}`)
      console.log('URL endpoint:', API_ENDPOINTS.usuarioSeguidor.unfollow(idUser, idAmigo))
      
      const response = await apiClient.delete(API_ENDPOINTS.usuarioSeguidor.unfollow(idUser, idAmigo))
      console.log('Respuesta del unfollow:', response)
      return response && (response as any).status !== 404
    } catch (error) {
      console.error("Error al dejar de seguir usuario:", error)
      console.error("Error completo:", JSON.stringify(error, null, 2))
      return false
    }
  },

  async getAmigos(idUser: number): Promise<UserSearchResult[]> {
    try {
      console.log(`Obteniendo amigos del usuario ${idUser}`)
      const res = await apiClient.get<any>(API_ENDPOINTS.usuarioSeguidor.getAmigos(idUser))
      
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = res?.data?.data ?? res?.data ?? []
      console.log('Amigos obtenidos:', payload)
      return payload as UserSearchResult[]
    } catch (error) {
      console.error("Error al obtener amigos:", error)
      return []
    }
  }
}