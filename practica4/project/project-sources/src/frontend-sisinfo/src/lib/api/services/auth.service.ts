// import { apiClient } from "../client"
// import { API_ENDPOINTS } from "../config"

// export interface LoginPayload {
//   email: string
//   password: string
// }

// export interface RegisterPayload {
//   username: string
//   email: string
//   password: string
//   realName: string
// }

// export interface AuthResponse {
//   token: string
//   refreshToken: string
//   user: {
//     id: string
//     username: string
//     email: string
//     role: "user" | "admin"
//   }
// }

// export const authService = {
//   async login(payload: LoginPayload) {
//     const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, payload)

//     if (response.success && response.data) {
//       localStorage.setItem("authToken", response.data.token)
//       localStorage.setItem("refreshToken", response.data.refreshToken)
//     }

//     return response
//   },

//   async register(payload: RegisterPayload) {
//     const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, payload)

//     if (response.success && response.data) {
//       localStorage.setItem("authToken", response.data.token)
//       localStorage.setItem("refreshToken", response.data.refreshToken)
//     }

//     return response
//   },

//   async logout() {
//     const response = await apiClient.post(API_ENDPOINTS.auth.logout)

//     localStorage.removeItem("authToken")
//     localStorage.removeItem("refreshToken")

//     return response
//   },

//   async refresh() {
//     const refreshToken = localStorage.getItem("refreshToken")

//     if (!refreshToken) {
//       return { success: false, error: "No refresh token available" }
//     }

//     const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.auth.refresh, {
//       refreshToken,
//     })

//     if (response.success && response.data) {
//       localStorage.setItem("authToken", response.data.token)
//     }

//     return response
//   },
// }

import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  realName: string
}

export interface AuthResponse {
  token?: string
  refreshToken?: string
  user?: {
    id: number
    username: string
    email: string
    role: "user" | "admin"
  }
  message?: string
}

export const authService = {
async login(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, payload);

  if (response.success && response.data) {
    const result = response.data as any;
    const authData = result.data ?? result; // para soportar el ApiResponseBase del backend

    const { token, refreshToken, user } = authData;

    if (token) localStorage.setItem("authToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("fylt_user", JSON.stringify(user));

    return { success: true, data: authData };
  }

  return { success: false, error: response.error };
},

  // Registro
async register(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    realName: payload.realName,
    boolAdmin: false,
  });

  if (response.success && response.data) {
    const result = response.data as any;
    const authData = result.data ?? result; // soporta ApiResponseBase.Ok() y respuestas planas

    const { token, refreshToken, user } = authData;

    if (token) localStorage.setItem("authToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("fylt_user", JSON.stringify(user));

    return { success: true, data: authData };
  }

  return { success: false, error: response.error || "Error en registro" };
},


  async logout() {
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
    return { success: true }
  },


  async refresh() {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      return { success: false, error: "No refresh token available" }
    }

    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.auth.refresh, {
      refreshToken,
    })

    if (response.success && response.data?.token) {
      localStorage.setItem("authToken", response.data.token)
    }

    return response
  },
}

