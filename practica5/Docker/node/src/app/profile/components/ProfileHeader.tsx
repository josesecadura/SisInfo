"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { User } from "@/lib/api/services/user.service"

interface ProfileHeaderProps {
  profile: User | null
  onEditClick: () => void
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted shrink-0">
        <div className="w-full h-full flex items-center justify-center">
          {profile?.avatar ? (
            <Image 
              src={profile.avatar} 
              alt={profile.username || profile.fullName || "Avatar"} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted-foreground/20" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-2xl md:text-3xl font-bold">
              {profile?.fullName ?? profile?.username ?? "Usuario_777"}
            </div>
            <div className="text-sm text-muted-foreground">
              @{profile?.username ?? "usuario"}
            </div>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            onClick={onEditClick}
          >
            Editar perfil
          </Button>
        </div>
        <p className="text-muted-foreground leading-relaxed">{profile?.bio ?? ""}</p>
        {profile && (
          <div className="mt-3 text-sm text-muted-foreground">
            <div>Email: {profile.email}</div>
          </div>
        )}
        {/* Estadísticas de seguimiento */}
        <div className="flex items-center gap-4 mt-3">
          <div className="text-center">
            <div className="font-semibold text-lg">{profile?.followers ?? 0}</div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">{profile?.following ?? 0}</div>
            <div className="text-xs text-muted-foreground">Siguiendo</div>
          </div>
        </div>
      </div>
    </div>
  )
}
