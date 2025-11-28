import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface ApiKeyPayload {
  nombre: string
  direccion: string
}

export const apiKeyService = {
  async create(payload: ApiKeyPayload) {
    return apiClient.post(API_ENDPOINTS.apiKeys.create, payload)
  },

  async list() {
    return apiClient.get(API_ENDPOINTS.apiKeys.list)
  },
}
