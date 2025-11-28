import { API_CONFIG } from "./config"

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export class ApiClient {
  private baseURL: string
  private headers: HeadersInit

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.headers = API_CONFIG.headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`

      // Add auth token if available
      const token = localStorage.getItem("authToken")
      const headers: HeadersInit = {
        ...this.headers,
        ...options.headers,
      }

      if (token) {
        // HeadersInit may be a Headers object or Record<string,string>. Cast to any to set Authorization.
        ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }

      // Use AbortController + setTimeout so it works reliably in browsers
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

      // Debug: log request details so we can see in the browser console
      try {
        console.debug("[apiClient] fetch", options.method ?? "GET", url, options.body ?? null)
      } catch (e) {
        // ignore console errors
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("[v0] API request error:", error)
      return {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
    })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()
