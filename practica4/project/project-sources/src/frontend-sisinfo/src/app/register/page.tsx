"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, User } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    realName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    const result = await register({
      realName: formData.realName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      avatar: avatarPreview || undefined,
    })

    if (!result.success) {
      setError(result.error || "Error al crear la cuenta")
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAvatarClick = () => {
    // Mock avatar upload
    alert("La carga de avatar no está implementada en esta demo")
  }

  const handleGoogleRegister = () => {
    // Mock Google register
    alert("Google Sign-In no está implementado en esta demo")
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-background items-center justify-center p-8 md:p-12">
        <div className="max-w-md">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Fylt</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">Cine, series y comunidad.</p>
          <p className="text-xl md:text-2xl text-muted-foreground">Todo en un mismo sitio.</p>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-card">
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Fylt</h1>
            <p className="text-sm md:text-base text-muted-foreground">Cine, series y comunidad</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Crear Cuenta</h2>

            {/* Avatar upload */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center group"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                )}
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-7 md:h-7 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <Camera className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="realName">Nombre real:</Label>
                <Input
                  id="realName"
                  name="realName"
                  type="text"
                  placeholder="Escribe tu nombre completo"
                  value={formData.realName}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario:</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Escribe tu nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico:</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Escribe aquí tu correo"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña:</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Escribe aquí tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña:</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-10 md:h-11" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

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
              onClick={handleGoogleRegister}
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
              Registrarse con Google
            </Button>

            <p className="text-center text-xs md:text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
