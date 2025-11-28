import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface UserCardProps {
  id: number
  username: string
  seguidores?: number
  seguidos?: number
  avatar?: string | null
  isFollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
  onViewProfile: () => void
}

export function UserCard({
  id,
  username,
  seguidores = 0,
  seguidos = 0,
  avatar,
  isFollowing,
  onFollow,
  onUnfollow,
  onViewProfile,
}: UserCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
          {avatar ? (
            <Image 
              src={avatar} 
              alt={username} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted-foreground/20">
              <span className="text-sm font-medium">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">@{username}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{seguidores} seguidores</span>
            <span>{seguidos} siguiendo</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
          >
            Ver perfil
          </Button>
          
          {isFollowing ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onUnfollow}
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              Siguiendo
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onFollow}
            >
              Seguir
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}