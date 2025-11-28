"use client"

import { useState } from "react"
import { listService } from "@/lib/api/services/list.service"

interface CreateListOptions {
  onSuccess?: (newList: any) => void
  onError?: (error: any) => void
  addMovieToList?: boolean
  movieId?: number
}

export function useCreateList() {
  const [createListOpen, setCreateListOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListImageFile, setNewListImageFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const createList = async (options: CreateListOptions = {}) => {
    if (!newListName.trim()) return

    setIsCreating(true)
    try {
      // Obtener el usuario actual
      const userData = JSON.parse(localStorage.getItem("fylt_user") || "{}")
      const userId = userData.id || "1"

      // Crear la lista
      let imagenUrl = "/icon_lista.png" // imagen por defecto
      if (newListImageFile) {
        // Por ahora usar URL temporal - en producción se subiría al servidor
        imagenUrl = URL.createObjectURL(newListImageFile)
      }

      const listaData = { 
        Nombre: newListName.trim(),
        Descripcion: `Lista creada por ${userData.username || 'usuario'}`,
        Imagen: imagenUrl
      }

      let newListId: any
      const isLogged = Boolean(localStorage.getItem("authToken"))

      if (isLogged) {
        try {
          // Intentar usar createWithUser primero
          const res = await listService.createWithUser(userId, listaData)
          const anyRes = res as any
          newListId = anyRes?.data?.data?.id ?? anyRes?.data?.id ?? anyRes?.id
        } catch (e) {
          // Fallback: usar create estándar
          console.log("Fallback a create estándar")
          const res = await listService.create(listaData)
          const anyRes = res as any
          newListId = anyRes?.data?.data ?? anyRes?.data ?? anyRes
        }

        // Si se especifica añadir película y tenemos el ID
        if (options.addMovieToList && options.movieId && newListId) {
          try {
            await listService.addPelicula(newListId, options.movieId)
          } catch (e) {
            console.error("Error añadiendo película a la nueva lista:", e)
          }
        }

        // Llamar callback de éxito
        if (options.onSuccess) {
          // Obtener la lista completa para pasar al callback
          try {
            const createdList = await listService.getById(newListId)
            options.onSuccess(createdList)
          } catch (e) {
            options.onSuccess({ id: newListId, nombre: newListName.trim() })
          }
        }
      } else {
        // Modo offline - localStorage
        const newList = { 
          id: `list_${Date.now()}`, 
          name: newListName.trim(), 
          items: options.addMovieToList && options.movieId ? [options.movieId] : [] 
        }
        
        try {
          const raw = localStorage.getItem("fylt_lists")
          const arr = raw ? JSON.parse(raw) : []
          arr.push(newList)
          localStorage.setItem("fylt_lists", JSON.stringify(arr))
          
          if (options.onSuccess) {
            options.onSuccess(newList)
          }
        } catch (e) {
          console.error("Error creando lista local:", e)
          if (options.onError) options.onError(e)
        }
      }

      // Limpiar formulario y cerrar
      setNewListName("")
      setNewListImageFile(null)
      setCreateListOpen(false)

    } catch (error) {
      console.error("Error creando lista:", error)
      if (options.onError) {
        options.onError(error)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const openCreateDialog = () => {
    setCreateListOpen(true)
  }

  const closeCreateDialog = () => {
    setCreateListOpen(false)
    setNewListName("")
    setNewListImageFile(null)
  }

  return {
    // Estados
    createListOpen,
    newListName,
    newListImageFile,
    isCreating,
    
    // Funciones
    createList,
    openCreateDialog,
    closeCreateDialog,
    setNewListName,
    setNewListImageFile,
  }
}