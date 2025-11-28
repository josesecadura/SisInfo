"use client"

import { AlertTriangle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ErrorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
}

export function ErrorDialog({
    open,
    onOpenChange,
    title = "Error",
    description = "Ha ocurrido un error inesperado."
}: ErrorDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/20">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center text-red-600 dark:text-red-400">
                {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground text-center leading-relaxed">
                {description}
            </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter className="flex justify-center">
            <Button
                className="flex-1 max-w-32"
                onClick={() => onOpenChange(false)}
            >
                Entendido
            </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    )
}