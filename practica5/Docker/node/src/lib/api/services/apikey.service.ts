import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface ApiKey {
  id: number
  nombre: string
  direccion: string
  fecha?: string
}

export interface CreateApiKeyDTO {
  nombre: string
  direccion: string
}

export interface UpdateApiKeyDTO {
  id: number
  nombre: string
  direccion: string
}

function unwrap<T>(res: any): T {
  if (!res) throw new Error("Sin respuesta del servidor")
  if (res.success === false) throw new Error(res.message || "Error API")
  
  const backendResponse = res.data
  
  if (!backendResponse) throw new Error("No hay datos en la respuesta")
  
  if (Array.isArray(backendResponse)) {
    return backendResponse as T
  }
  
  if (backendResponse.success !== false && backendResponse.data) {
    if (Array.isArray(backendResponse.data)) {
      return backendResponse.data as T
    }
    
    if (typeof backendResponse.data === 'object') {
      for (const key of Object.keys(backendResponse.data)) {
        if (Array.isArray(backendResponse.data[key])) {
          return backendResponse.data[key] as T
        }
      }
    }
  }
  
  if (typeof backendResponse === 'object') {
    for (const key of Object.keys(backendResponse)) {
      if (Array.isArray(backendResponse[key])) {
        return backendResponse[key] as T
      }
    }
  }
  
  if (backendResponse.success !== false && Array.isArray(res.data)) {
    return res.data as T
  }
  
  return backendResponse as T
}

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.apiKeys.list)
      
      if (!res.success) {
        return []
      }
      
      const result = unwrap<ApiKey[]>(res)
      
      if (!Array.isArray(result)) {
        return []
      }
      
      return result
    } catch (e) {
      return []
    }
  },

  async create(payload: CreateApiKeyDTO): Promise<number> {
    try {
      const res = await apiClient.post(API_ENDPOINTS.apiKeys.create, payload)
      
      if (!res.success) {
        throw new Error(res.error || res.message || "Error al crear API key")
      }
      
      return unwrap<number>(res)
    } catch (e) {
      throw new Error(`Error al crear API key: ${(e as Error).message}`)
    }
  },

  async update(id: number, payload: UpdateApiKeyDTO): Promise<boolean> {
    try {
      const res = await apiClient.put(API_ENDPOINTS.apiKeys.update(id), payload)
      
      if (!res.success) {
        throw new Error(res.error || res.message || "Error al actualizar API key")
      }
      
      return unwrap<boolean>(res)
    } catch (e) {
      throw new Error(`Error al actualizar API key: ${(e as Error).message}`)
    }
  },

  async remove(id: number): Promise<boolean> {
    try {
      const res = await apiClient.delete(API_ENDPOINTS.apiKeys.delete(id))
      
      if (!res.success) {
        throw new Error(res.error || res.message || "Error al eliminar API key")
      }
      
      return unwrap<boolean>(res)
    } catch (e) {
      console.error('[apiKeyService.remove] Error:', e)
      throw new Error(`Error al eliminar API key: ${(e as Error).message}`)
    }
  },

  // Métodos legacy para compatibilidad
  async list() {
    return this.getAll()
  }
}
