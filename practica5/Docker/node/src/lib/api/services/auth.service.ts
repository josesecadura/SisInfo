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
  avatar?: string
  bio?: string
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
  console.log("📊 Enviando registro con datos:", {
    username: payload.username,
    email: payload.email,
    realName: payload.realName,
    hasAvatar: !!payload.avatar,
    avatarSize: payload.avatar ? (payload.avatar.length / 1024).toFixed(2) + "KB" : "N/A",
    hasBio: !!payload.bio,
    bioLength: payload.bio ? payload.bio.length : 0
  });
  
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    realName: payload.realName,
    foto: payload.avatar, // Enviamos el avatar como 'foto' que es como lo espera el backend
    descripcion: payload.bio, // Enviamos la bio como 'descripcion' que es como lo espera el backend
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

