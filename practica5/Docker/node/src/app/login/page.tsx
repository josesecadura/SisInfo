"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ActividadService } from "@/lib/api/services/actividad.service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      // Registrar login fallido
      await ActividadService.registrarActividad({
        tipoActividad: "LOGIN_FALLIDO",
        detalles: `Intento con email: ${email}`
      })
      // Verificar si es un error 401 (credenciales incorrectas)
      const errorMsg = result.error || "Error al iniciar sesión"
      if (errorMsg.includes("401") || errorMsg.includes("Unauthorized") || errorMsg.includes("credenciales")) {
        setShowErrorDialog(true)
      } else {
        setError(errorMsg)
      }
      setIsLoading(false)
    } else {
      // Registrar login exitoso
      await ActividadService.registrarActividad({
        tipoActividad: "LOGIN_EXITOSO",
        idUsuario: result.user?.id,
        detalles: "Login correcto"
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-background items-center justify-center p-8 md:p-12">
        <div className="max-w-md">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">Fylt</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">Cine, series y comunidad.</p>
          <p className="text-xl md:text-2xl text-muted-foreground">Todo en un mismo sitio.</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-card">
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-6 md:mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Fylt</h1>
            <p className="text-sm md:text-base text-muted-foreground">Cine, series y comunidad</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Iniciar Sesión</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico:</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Escriba aquí su correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña:</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Escriba aquí su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-10 md:h-11" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Inicio con google no implementao aun
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white text-black hover:bg-gray-100 h-10 md:h-11"
              disabled
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Iniciar Sesión con Google
            </Button>
            */}

            <p className="text-center text-xs md:text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Regístrate
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted rounded-lg text-xs space-y-2">
              <p className="font-semibold">Credenciales de prueba:</p>
              <p>
                <strong>Admin:</strong> admin@fylt.com / admin123
              </p>
              <p>
                <strong>Usuario:</strong> user@fylt.com / user123
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog para errores de credenciales */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credenciales incorrectas</DialogTitle>
            <DialogDescription>
              El email o la contraseña que has introducido no son correctos.
              <br />
              Por favor, verifica tus datos e inténtalo de nuevo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorDialog(false)}>
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
