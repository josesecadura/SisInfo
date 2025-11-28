"use client"

import { useState, useEffect } from "react"

export interface CurrentUser {
  id: number | string
  username: string
  email?: string
  fullName?: string
  role?: string
  fotoPerfil?: string | null
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const authToken = localStorage.getItem("authToken")
      const userData = localStorage.getItem("fylt_user")
      
      if (authToken && userData) {
        const parsed = JSON.parse(userData)
        setUser({
          id: parsed.id || parsed.Id || 0,
          username: parsed.username || parsed.userName || parsed.user || "usuario",
          email: parsed.email || parsed.correo || "",
          fullName: parsed.fullName || parsed.realName || "",
          role: parsed.role || (parsed.boolAdmin ? "admin" : "user"),
          fotoPerfil: parsed.fotoPerfil || parsed.foto || null,
        })
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = (newUserData: Partial<CurrentUser>) => {
    if (!user) return

    const updated = { ...user, ...newUserData }
    setUser(updated)
    
    // Actualizar localStorage también
    try {
      const stored = localStorage.getItem("fylt_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        const merged = { ...parsed, ...newUserData }
        localStorage.setItem("fylt_user", JSON.stringify(merged))
      }
    } catch (error) {
      console.error("Error updating user data in localStorage:", error)
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("fylt_user")
    }
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    updateUser,
    logout,
  }
}