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
      const res = await apiClient.get<any>(API_ENDPOINTS.usuarioSeguidor.buscar(username))
      
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = res?.data?.data ?? res?.data ?? []
      return payload as UserSearchResult[]
    } catch (error) {
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
      
      const response = await apiClient.post(API_ENDPOINTS.usuarioSeguidor.seguir, payload)
      return response && (response as any).status !== 409
    } catch (error) {
      // Si es un error 409 (Conflict), significa que ya lo sigue
      if ((error as any)?.response?.status === 409) {
        return false
      }
      return false
    }
  },

  async unfollow(idUser: number, idAmigo: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.usuarioSeguidor.unfollow(idUser, idAmigo))

      return response && (response as any).status !== 404
    } catch (error) {
      return false
    }
  },

  async getAmigos(idUser: number): Promise<UserSearchResult[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.usuarioSeguidor.getAmigos(idUser))
      
      // El backend devuelve ApiResponseBase con { data: [...] }
      const payload = res?.data?.data ?? res?.data ?? []
      return payload as UserSearchResult[]
    } catch (error) {
      return []
    }
  }
}