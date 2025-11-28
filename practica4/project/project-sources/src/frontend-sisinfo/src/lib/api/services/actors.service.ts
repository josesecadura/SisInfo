import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export const actorService = {
  async getPopulares() {
    return apiClient.get(API_ENDPOINTS.actors.populares)
  },
}
