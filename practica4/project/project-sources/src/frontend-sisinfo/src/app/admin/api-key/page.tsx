"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiKeyService } from "@/lib/api/services/apikey.service"
import { toast } from "sonner" // opcional si usas toasts
export default function ApiKeyPage() {
  const [tmdbKey, setTmdbKey] = useState("FSDKFJASDKJ34-7284V9SDDFS-DSFDSA")
  const [youtubeKey, setYoutubeKey] = useState("FSDKFJASDKJ34-7284V9SDDFS-DSFDSA")

const handleSaveTmdb = async () => {
  try {
    const response = await apiKeyService.create({
      nombre: "TMDB",
      direccion: tmdbKey,
    })

    if (response.success) {
      toast.success("✅ TMDB Key guardada correctamente")
    } else {
      toast.error("❌ Error al guardar la TMDB Key")
    }
  } catch (err) {
    console.error("Error al guardar TMDB key:", err)
    toast.error("Error al conectar con el servidor")
  }
}

const handleSaveYoutube = async () => {
  try {
    const response = await apiKeyService.create({
      nombre: "YouTube",
      direccion: youtubeKey,
    })

    if (response.success) {
      toast.success("✅ YouTube Key guardada correctamente")
    } else {
      toast.error("❌ Error al guardar la YouTube Key")
    }
  } catch (err) {
    console.error("Error al guardar YouTube key:", err)
    toast.error("Error al conectar con el servidor")
  }
}

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader currentPage="api-key" />
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-12 text-center text-3xl font-bold">Gestión Api Keys</h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="tmdb-key" className="text-lg font-semibold">
                API Key de TMDB:
              </Label>
              <div className="flex gap-4">
                <Input
                  id="tmdb-key"
                  type="text"
                  value={tmdbKey}
                  onChange={(e) => setTmdbKey(e.target.value)}
                  className="flex-1 border-2 border-border bg-background text-foreground"
                />
                <Button
                  onClick={handleSaveTmdb}
                  className="border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Guardar
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="youtube-key" className="text-lg font-semibold">
                API Key de Youtube Data:
              </Label>
              <div className="flex gap-4">
                <Input
                  id="youtube-key"
                  type="text"
                  value={youtubeKey}
                  onChange={(e) => setYoutubeKey(e.target.value)}
                  className="flex-1 border-2 border-border bg-background text-foreground"
                />
                <Button
                  onClick={handleSaveYoutube}
                  className="border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
