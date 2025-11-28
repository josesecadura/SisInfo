"use client"

import Link from "next/link"
import { LogIn, UserPlus, Lock } from "lucide-react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface AuthRequiredDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
}

export function AuthRequiredDialog({
    open,
    onOpenChange,
    title = "Acceso restringido",
    description = "Debes registrarte o iniciar sesión para acceder a esta función."
}: AuthRequiredDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center">
                {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground text-center leading-relaxed">
                {description}
            </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/10 dark:hover:text-red-300 dark:hover:border-red-300 transition-colors"
                onClick={() => onOpenChange(false)}
            >
                Cancelar
            </Button>
            
            <Button
                variant="outline"
                className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/10 dark:hover:text-blue-300 dark:hover:border-blue-300 transition-colors"
                onClick={() => onOpenChange(false)}
                asChild
            >
                <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" />
                Registrarse
                </Link>
            </Button>
            
            <Button 
                className="flex-1"
                onClick={() => onOpenChange(false)}
                asChild
            >
                <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
                </Link>
            </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    )
}