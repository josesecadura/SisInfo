"use client"

import { CheckCircle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface SuccessDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
}

export function SuccessDialog({
    open,
    onOpenChange,
    title = "Éxito",
    description = "La operación se completó correctamente."
}: SuccessDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center text-green-600 dark:text-green-400">
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