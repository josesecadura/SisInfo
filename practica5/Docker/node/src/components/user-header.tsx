"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { AuthRequiredDialog } from "@/components/auth-required-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    description: ""
  })

  const handleProtectedLinkClick = (e: React.MouseEvent, sectionName: string) => {
    if (!user) {
      e.preventDefault()
      setDialogConfig({
        title: `Accede a ${sectionName}`,
        description: `Debes registrarte o iniciar sesión para acceder a ${sectionName.toLowerCase()}.`
      })
      setShowAuthDialog(true)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="text-2xl md:text-3xl font-bold">
            Fylt
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Principal
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/search" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Buscar
            </Link>
            <Link
              href="/community"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/community" ? "text-foreground" : "text-muted-foreground"
              }`}
              onClick={(e) => handleProtectedLinkClick(e, "Comunidad")}
            >
              Comunidad
            </Link>
            <Link
              href="/amigos"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/amigos" ? "text-foreground" : "text-muted-foreground"
              }`}
              onClick={(e) => handleProtectedLinkClick(e, "Amigos")}
            >
              Amigos
            </Link>
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/profile" ? "text-foreground" : "text-muted-foreground"
              }`}
              onClick={(e) => handleProtectedLinkClick(e, "Mi Perfil")}
            >
              Mi Perfil
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 hover:bg-muted/80 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.username}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title={dialogConfig.title}
        description={dialogConfig.description}
      />
    </header>
  )
}
