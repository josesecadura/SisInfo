"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = "info", isOpen, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  }

  const Icon = icons[type]

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-md ${typeStyles[type]}`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Hook para usar el toast más fácilmente
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "info"
    isOpen: boolean
  }>({ message: "", type: "info", isOpen: false })

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, isOpen: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }))
  }

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent: () => (
      <Toast 
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={hideToast}
      />
    )
  }
}