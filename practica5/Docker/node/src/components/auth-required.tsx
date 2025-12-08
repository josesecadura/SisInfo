"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthRequiredProps {
  children: React.ReactNode
  redirectTo?: string
  requireAdmin?: boolean
}

export function AuthRequired({ children, redirectTo = "/login", requireAdmin = false }: AuthRequiredProps) {
  const { isLoggedIn, isLoading, user } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push(redirectTo)
    } else if (!isLoading && isLoggedIn && requireAdmin && user?.role !== "admin") {
      // Si requiere admin pero no es admin, redirigir al inicio
      router.push("/")
    }
  }, [isLoggedIn, isLoading, user, requireAdmin, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null // No renderizar nada mientras redirige
  }

  if (requireAdmin && user?.role !== "admin") {
    return null // No renderizar si requiere admin y no lo es (mientras redirige)
  }

  return <>{children}</>
}
