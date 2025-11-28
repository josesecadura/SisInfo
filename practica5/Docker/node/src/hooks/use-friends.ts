"use client"

import { useState, useEffect } from "react"
import { useCurrentUser } from "./use-current-user"
import { usuarioSeguidorService, UserSearchResult } from "@/lib/api/services/usuarioSeguidor.service"

export function useFriends() {
  const { user, isLoggedIn } = useCurrentUser()
  const [friends, setFriends] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const loadFriends = async () => {
    if (!isLoggedIn || !user?.id) {
      setFriends([])
      return
    }

    setLoading(true)
    try {
      console.log(`Cargando amigos para usuario ${user.id}`)
      const amigos = await usuarioSeguidorService.getAmigos(Number(user.id))
      setFriends(amigos)
    } catch (error) {
      console.error("Error cargando amigos:", error)
      setFriends([])
    } finally {
      setLoading(false)
    }
  }

  const followUser = async (idAmigo: number): Promise<boolean> => {
    if (!isLoggedIn || !user?.id) return false

    try {
      const success = await usuarioSeguidorService.seguir(Number(user.id), idAmigo)
      if (success) {
        // Recargar la lista de amigos
        await loadFriends()
      }
      return success
    } catch (error) {
      console.error("Error siguiendo usuario:", error)
      return false
    }
  }

  const unfollowUser = async (idAmigo: number): Promise<boolean> => {
    if (!isLoggedIn || !user?.id) return false

    try {
      const success = await usuarioSeguidorService.unfollow(Number(user.id), idAmigo)
      if (success) {
        // Actualizar la lista de amigos eliminando al usuario
        setFriends(prev => prev.filter(friend => friend.id !== idAmigo))
      }
      return success
    } catch (error) {
      console.error("Error dejando de seguir usuario:", error)
      return false
    }
  }

  const searchUsers = async (username: string): Promise<UserSearchResult[]> => {
    if (!username.trim()) return []

    try {
      console.log(`Buscando usuarios: ${username}`)
      const results = await usuarioSeguidorService.buscar(username.trim())
      
      // 🚫 Filtrar administradores y usuario actual (no mostrar usuarios admin ni a ti mismo)
      const filteredResults = results.filter(searchUser => {
        // Excluir usuarios que sean admin
        const isAdmin = searchUser.boolAdmin || searchUser.role === 'admin'
        
        // Excluir el usuario actual (no mostrarse a sí mismo)
        const isCurrentUser = searchUser.id === Number(user?.id) || searchUser.id === user?.id
        
        return !isAdmin && !isCurrentUser
      })
      
      // Marcar cuáles ya son amigos
      const resultsWithFollowStatus = filteredResults.map(result => ({
        ...result,
        isFollowing: friends.some(friend => friend.id === result.id)
      }))

      return resultsWithFollowStatus
    } catch (error) {
      console.error("Error buscando usuarios:", error)
      return []
    }
  }

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadFriends()
    }
  }, [isLoggedIn, user?.id])

  return {
    friends,
    loading,
    loadFriends,
    followUser,
    unfollowUser,
    searchUsers,
  }
}