"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que quieres continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default"
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground leading-relaxed">{message}</p>
        </div>
        <DialogFooter>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
              {cancelText}
            </Button>
            <Button 
              onClick={handleConfirm}
              variant={variant === "destructive" ? "destructive" : "default"}
              className="flex-1 sm:flex-none"
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar el diálogo de confirmación más fácilmente
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText: string
    cancelText: string
    variant: "default" | "destructive"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    variant: "default"
  })

  const showConfirm = (
    message: string, 
    onConfirm: () => void, 
    options?: {
      title?: string
      confirmText?: string
      cancelText?: string
      variant?: "default" | "destructive"
    }
  ) => {
    setDialog({
      isOpen: true,
      title: options?.title || "Confirmar acción",
      message,
      onConfirm,
      confirmText: options?.confirmText || "Confirmar",
      cancelText: options?.cancelText || "Cancelar",
      variant: options?.variant || "default"
    })
  }

  const hideConfirm = () => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }

  return {
    showConfirm,
    hideConfirm,
    ConfirmComponent: () => (
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={hideConfirm}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        variant={dialog.variant}
      />
    )
  }
}