"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "./api"
import { apiClient } from "./api/client"
import { API_ENDPOINTS } from "./api/config"
import type { RegisterPayload } from "./api/services/auth.service"

interface User {
  id: string
  email: string
  realName: string
  username: string
  role: "admin" | "user"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  realName: string
  username: string
  email: string
  password: string
  avatar?: string
  bio?: string
}

interface ApiResponseBase<T> {
  success: boolean;
  data: T;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()


useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    setIsLoading(false);
    return;
  }

  const validate = async () => {
    const res = await apiClient.get<ApiResponseBase<User>>(API_ENDPOINTS.auth.me);

    if (res.success && res.data?.data) {
      const user = res.data.data;
      setUser(user);
      localStorage.setItem("fylt_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("fylt_user");
      setUser(null);
    }

    setIsLoading(false);
  };

  validate();
}, []);


  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })

      if (!response.success) {
        return { success: false, error: response.error || "Credenciales inválidas" }
      }

      const user = response.data?.user
      if (user) {
        setUser(user)
        localStorage.setItem("fylt_user", JSON.stringify(user))
      }

      if (user?.role === "admin") router.push("/admin/peliculas")
      else router.push("/")

      return { success: true }
    } catch (error) {
      return { success: false, error: "Error al conectar con el servidor" }
    }
  }


const register = async (payload: RegisterPayload) => {
  setIsLoading(true);
  const response = await authService.register(payload);
  setIsLoading(false);

  if (response.success && response.data?.user) {
    const user = response.data.user;
    setUser(user);
    localStorage.setItem("fylt_user", JSON.stringify(user));
    router.push("/");
    return { success: true };
  } else {
    return { success: false, error: response.error || "Error al crear Usuario" };
  }
};


  const logout = () => {
    setUser(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("fylt_user")
    router.push("/login")
  }


  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}