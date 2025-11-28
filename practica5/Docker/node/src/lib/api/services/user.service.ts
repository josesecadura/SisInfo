import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface User {
  id: string | number
  username: string
  email: string
  fullName?: string
  realName?: string  // Backend field
  avatar?: string
  foto?: string | null  // Backend field
  role: "user" | "admin"
  boolAdmin?: boolean  // Backend field
  bio?: string
  descripcion?: string  // Backend field
  createdAt?: string
  followers?: number
  following?: number
  seguidores?: number  // Backend field
  seguidos?: number    // Backend field
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

  async changePassword(id: string | number, oldPassword: string, newPassword: string) {
    return apiClient.put(API_ENDPOINTS.users.changePassword(id), {
      oldPassword,
      newPassword
    })
  },

  async me() {
    return apiClient.get<User>(API_ENDPOINTS.auth.me)
  },
}
