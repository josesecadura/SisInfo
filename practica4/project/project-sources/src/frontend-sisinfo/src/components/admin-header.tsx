"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { LogOut } from "lucide-react"

interface AdminHeaderProps {
  currentPage: "peliculas" | "reviews" | "encuestas" | "api-key"
}

export function AdminHeader({ currentPage }: AdminHeaderProps) {
  const { logout } = useAuth()

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/admin" className="text-2xl md:text-3xl font-bold">
              Fylt
            </Link>
            <nav className="flex gap-4 md:gap-6">
              <Link
                href="/admin/peliculas"
                className={`text-xs md:text-sm transition-colors hover:text-foreground ${
                  currentPage === "peliculas" ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                Películas
              </Link>
              <Link
                href="/admin/encuestas"
                className={`text-xs md:text-sm transition-colors hover:text-foreground ${
                  currentPage === "encuestas" ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                Encuestas
              </Link>
              <Link
                href="/admin/api-key"
                className={`text-xs md:text-sm transition-colors hover:text-foreground ${
                  currentPage === "api-key" ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                Api Key
              </Link>
            </nav>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-xs">AP</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Admin_Pro</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
