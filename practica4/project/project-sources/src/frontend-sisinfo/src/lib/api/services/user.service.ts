import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar?: string
  role: "user" | "admin"
  bio?: string
  createdAt: string
}

export const userService = {
  async getAll() {
    return apiClient.get<User[]>(API_ENDPOINTS.users.getAll)
  },

  async getById(id: string | number) {
    return apiClient.get<User>(API_ENDPOINTS.users.getById(id))
  },

  async getProfile() {
    return apiClient.get<User>(API_ENDPOINTS.users.getProfile)
  },

  async update(id: string | number, user: Partial<User>) {
    return apiClient.put<User>(API_ENDPOINTS.users.update(id), user)
  },

  async delete(id: string | number) {
    return apiClient.delete(API_ENDPOINTS.users.delete(id))
  },
}
