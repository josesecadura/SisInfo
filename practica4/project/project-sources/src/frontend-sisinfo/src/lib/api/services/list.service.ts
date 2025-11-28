import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface ListaVO {
  id?: number
  nombre?: string
  nombreNormalized?: string
  descripcion?: string
}

export const listService = {
  async getAll() {
    const res = await apiClient.get<any>(API_ENDPOINTS.listas.getAll)
    if (!res || (res as any).success === false) return []
    return (res?.data?.data ?? res?.data ?? res) as any[]
  },

  async getById(id: string | number) {
    const res = await apiClient.get<any>(API_ENDPOINTS.listas.getById(id))
    if (!res || (res as any).success === false) return null
    return (res?.data?.data ?? res?.data ?? res) as any
  },

  async create(lista: { Nombre: string; Descripcion?: string }) {
    return apiClient.post(API_ENDPOINTS.listas.create, lista)
  },

  async update(id: string | number, lista: any) {
    return apiClient.put(API_ENDPOINTS.listas.update(id), lista)
  },

  async delete(id: string | number) {
    return apiClient.delete(API_ENDPOINTS.listas.delete(id))
  },

  async addPelicula(listaId: string | number, peliculaId: string | number) {
    return apiClient.post(API_ENDPOINTS.listas.addPelicula(listaId, peliculaId))
  },

  async removePelicula(listaId: string | number, peliculaId: string | number) {
    return apiClient.delete(API_ENDPOINTS.listas.removePelicula(listaId, peliculaId))
  },

  async getPeliculasByLista(listaId: string | number) {
    const res = await apiClient.get<any>(API_ENDPOINTS.listas.getPeliculasByLista(listaId))
    if (!res || (res as any).success === false) return []
    return (res?.data?.data ?? res?.data ?? res) as any[]
  },
}

// ListaVO already exported above
