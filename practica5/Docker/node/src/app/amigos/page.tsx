"use client"

import { useState } from "react"
import { Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { UserCard } from "@/components/user-card"
import { useFriends } from "@/hooks/use-friends"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import { UserSearchResult } from "@/lib/api/services/usuarioSeguidor.service"

export default function AmigosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  
  const { friends, loading, followUser, unfollowUser, searchUsers } = useFriends()
  const { isLoggedIn } = useCurrentUser()
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error en búsqueda:", error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleFollow = async (userId: number) => {
    const success = await followUser(userId)
    if (success) {
      // Actualizar los resultados de búsqueda para reflejar el nuevo estado
      setSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isFollowing: true }
          : user
      ))
    }
  }

  const handleUnfollow = async (userId: number) => {
    const success = await unfollowUser(userId)
    if (success) {
      // Actualizar los resultados de búsqueda para reflejar el nuevo estado
      setSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isFollowing: false }
          : user
      ))
    }
  }

  const handleViewProfile = (userId: number) => {
    router.push(`/profile/${userId}`)
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="text-center p-8">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Amigos</h1>
          <p className="text-muted-foreground">Debes iniciar sesión para ver y buscar amigos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Amigos</h1>
        <p className="text-muted-foreground">
          Busca usuarios y descubre nuevas recomendaciones de películas
        </p>
      </div>

      {/* Barra de búsqueda */}
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios por username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
          >
            {searchLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </Card>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Resultados de búsqueda</h2>
          <div className="space-y-3">
            {searchResults.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                username={user.username}
                seguidores={user.seguidores}
                seguidos={user.seguidos}
                avatar={user.fotoPerfil}
                isFollowing={user.isFollowing ?? false}
                onFollow={() => handleFollow(user.id)}
                onUnfollow={() => handleUnfollow(user.id)}
                onViewProfile={() => handleViewProfile(user.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sección "Usuarios que sigues" */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Usuarios que sigues</h2>
        
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Cargando amigos...</p>
        ) : friends.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aún no sigues a nadie</h3>
            <p className="text-muted-foreground mb-4">
              ¡Busca usuarios y empieza a descubrir recomendaciones!
            </p>
            <Button 
              variant="outline"
              onClick={() => document.querySelector('input')?.focus()}
            >
              Buscar usuarios
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <UserCard
                key={friend.id}
                id={friend.id}
                username={friend.username}
                seguidores={friend.seguidores}
                seguidos={friend.seguidos}
                avatar={friend.fotoPerfil}
                isFollowing={true}
                onFollow={() => {}} // No aplica porque ya lo sigue
                onUnfollow={() => handleUnfollow(friend.id)}
                onViewProfile={() => handleViewProfile(friend.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}