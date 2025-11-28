// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useEffect } from "react"
// import { useRouter } from "next/navigation"

// interface User {
//   id: string
//   email: string
//   name: string
//   username: string
//   role: "admin" | "user"
//   avatar?: string
// }

// interface AuthContextType {
//   user: User | null
//   login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
//   register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
//   logout: () => void
//   isLoading: boolean
// }

// interface RegisterData {
//   name: string
//   username: string
//   email: string
//   password: string
//   avatar?: string
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// // Mock users database
// const MOCK_USERS: User[] = [
//   {
//     id: "1",
//     email: "admin@fylt.com",
//     name: "Admin Pro",
//     username: "Admin_Pro",
//     role: "admin",
//   },
//   {
//     id: "2",
//     email: "user@fylt.com",
//     name: "Usuario Normal",
//     username: "Usuario_777",
//     role: "user",
//   },
// ]

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const router = useRouter()

//   // Load user from localStorage on mount
//   useEffect(() => {
//     const storedUser = localStorage.getItem("fylt_user")
//     if (storedUser) {
//       setUser(JSON.parse(storedUser))
//     }
//     setIsLoading(false)
//   }, [])

//   const login = async (email: string, password: string) => {
//     // Mock authentication
//     const foundUser = MOCK_USERS.find((u) => u.email === email)

//     if (!foundUser) {
//       return { success: false, error: "Usuario no encontrado" }
//     }

//     // Mock password validation (in real app, this would be server-side)
//     const validPasswords: Record<string, string> = {
//       "admin@fylt.com": "admin123",
//       "user@fylt.com": "user123",
//     }

//     if (validPasswords[email] !== password) {
//       return { success: false, error: "Contraseña incorrecta" }
//     }

//     // Save user to state and localStorage
//     setUser(foundUser)
//     localStorage.setItem("fylt_user", JSON.stringify(foundUser))

//     // Redirect based on role
//     if (foundUser.role === "admin") {
//       router.push("/admin/peliculas")
//     } else {
//       router.push("/")
//     }

//     return { success: true }
//   }

//   const register = async (data: RegisterData) => {
//     // Check if email already exists
//     const existingUser = MOCK_USERS.find((u) => u.email === data.email)
//     if (existingUser) {
//       return { success: false, error: "Este correo ya está registrado" }
//     }

//     // Check if username already exists
//     const existingUsername = MOCK_USERS.find((u) => u.username === data.username)
//     if (existingUsername) {
//       return { success: false, error: "Este nombre de usuario ya está en uso" }
//     }

//     // Create new user
//     const newUser: User = {
//       id: String(MOCK_USERS.length + 1),
//       email: data.email,
//       name: data.name,
//       username: data.username,
//       role: "user",
//       avatar: data.avatar,
//     }

//     // Add to mock database
//     MOCK_USERS.push(newUser)

//     // Save user to state and localStorage
//     setUser(newUser)
//     localStorage.setItem("fylt_user", JSON.stringify(newUser))

//     // Redirect to home
//     router.push("/")

//     return { success: true }
//   }

//   const logout = () => {
//     setUser(null)
//     localStorage.removeItem("fylt_user")
//     router.push("/login")
//   }

//   return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "./api"
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()


  useEffect(() => {
    const storedUser = localStorage.getItem("fylt_user")
    if (storedUser) setUser(JSON.parse(storedUser))
    setIsLoading(false)
  }, [])


  const login = async (email: string, password: string) => {
    try {
      console.log("🔹 Iniciando sesión:", email)
      const response = await authService.login({ email, password })
      console.log("🔹 Respuesta backend:", response)

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
      console.error("Error en login:", error)
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
    console.error("❌ Error en registro:", response.error);
    return { success: false, error: response.error || "Error al crear Usuario" };
  }
};


  const logout = () => {
    setUser(null)
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