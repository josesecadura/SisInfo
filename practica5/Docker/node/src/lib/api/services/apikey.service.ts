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
  console.log('[unwrap] Procesando respuesta completa:', JSON.stringify(res, null, 2))
  
  if (!res) throw new Error("Sin respuesta del servidor")
  if (res.success === false) throw new Error(res.message || "Error API")
  
  // El apiClient devuelve { data: backendResponse, success: true }
  // donde backendResponse puede ser { success: true, statusCode: 200, message: "...", data: [apikeys] }
  const backendResponse = res.data
  console.log('[unwrap] backendResponse:', JSON.stringify(backendResponse, null, 2))
  
  if (!backendResponse) throw new Error("No hay datos en la respuesta")
  
  // Si el backend devuelve un array directamente
  if (Array.isArray(backendResponse)) {
    console.log('[unwrap] backendResponse es array directo')
    return backendResponse as T
  }
  
  // Si el backend devuelve un objeto con success y data
  if (backendResponse.success !== false && backendResponse.data) {
    console.log('[unwrap] backendResponse.data encontrado:', backendResponse.data)
    
    // Si data es un array
    if (Array.isArray(backendResponse.data)) {
      console.log('[unwrap] backendResponse.data es array')
      return backendResponse.data as T
    }
    
    // Si data es un objeto, buscar arrays dentro
    if (typeof backendResponse.data === 'object') {
      console.log('[unwrap] backendResponse.data es objeto, explorando...')
      for (const key of Object.keys(backendResponse.data)) {
        if (Array.isArray(backendResponse.data[key])) {
          console.log(`[unwrap] Array encontrado en backendResponse.data.${key}`)
          return backendResponse.data[key] as T
        }
      }
    }
  }
  
  // Buscar arrays en cualquier nivel del backendResponse
  if (typeof backendResponse === 'object') {
    console.log('[unwrap] Explorando backendResponse como objeto...')
    for (const key of Object.keys(backendResponse)) {
      if (Array.isArray(backendResponse[key])) {
        console.log(`[unwrap] Array encontrado en backendResponse.${key}`)
        return backendResponse[key] as T
      }
    }
  }
  
  // Si el backend devuelve un objeto con success pero los datos están en el nivel superior
  if (backendResponse.success !== false && Array.isArray(res.data)) {
    console.log('[unwrap] Usando res.data como array')
    return res.data as T
  }
  
  console.log('[unwrap] Como último recurso, devolviendo backendResponse tal como está')
  // Como último recurso, intentar devolver los datos tal como están
  return backendResponse as T
}

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.apiKeys.list)
      console.log('[apiKeyService.getAll] Respuesta completa:', res)
      console.log('[apiKeyService.getAll] Tipo de respuesta:', typeof res)
      console.log('[apiKeyService.getAll] res.success:', res?.success)
      console.log('[apiKeyService.getAll] res.data:', res?.data)
      console.log('[apiKeyService.getAll] Tipo de res.data:', typeof res?.data)
      
      if (!res.success) {
        console.error('Error al obtener API keys:', res)
        return []
      }
      
      const result = unwrap<ApiKey[]>(res)
      console.log('[apiKeyService.getAll] Resultado después de unwrap:', result)
      console.log('[apiKeyService.getAll] Es array el resultado:', Array.isArray(result))
      
      // Asegurar que siempre devolvemos un array
      if (!Array.isArray(result)) {
        console.error('[apiKeyService.getAll] El resultado no es un array, devolviendo array vacío')
        return []
      }
      
      return result
    } catch (e) {
      console.error('[apiKeyService.getAll] Error:', e)
      // En caso de error, devolver array vacío en lugar de lanzar excepción
      return []
    }
  },

  async create(payload: CreateApiKeyDTO): Promise<number> {
    try {
      const res = await apiClient.post(API_ENDPOINTS.apiKeys.create, payload)
      console.log('[apiKeyService.create] Respuesta:', res)
      
      if (!res.success) {
        throw new Error(res.error || res.message || "Error al crear API key")
      }
      
      return unwrap<number>(res)
    } catch (e) {
      console.error('[apiKeyService.create] Error:', e)
      throw new Error(`Error al crear API key: ${(e as Error).message}`)
    }
  },

  async update(id: number, payload: UpdateApiKeyDTO): Promise<boolean> {
    try {
      const res = await apiClient.put(API_ENDPOINTS.apiKeys.update(id), payload)
      console.log('[apiKeyService.update] Respuesta:', res)
      
      if (!res.success) {
        throw new Error(res.error || res.message || "Error al actualizar API key")
      }
      
      return unwrap<boolean>(res)
    } catch (e) {
      console.error('[apiKeyService.update] Error:', e)
      throw new Error(`Error al actualizar API key: ${(e as Error).message}`)
    }
  },

  async remove(id: number): Promise<boolean> {
    try {
      const res = await apiClient.delete(API_ENDPOINTS.apiKeys.delete(id))
      console.log('[apiKeyService.remove] Respuesta:', res)
      
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
