"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, Trash2, Eye, EyeOff, Key, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"
import { useEffect } from "react"

interface ApiKey {
  id: number
  name: string
  key: string
  description: string
  permissions: "read" | "write" | "admin"
  createdAt: Date
  lastUsed: Date | null
  status: "active" | "revoked"
}

const mockApiKeys: ApiKey[] = [
  {
    id: 1,
    name: "Production API Key",
    key: "sk_live_51234567890abcdefghijklmnopqrstuvwxyz",
    description: "API key para el entorno de producción",
    permissions: "admin",
    createdAt: new Date("2024-01-15"),
    lastUsed: new Date("2024-02-01"),
    status: "active",
  },
  {
    id: 2,
    name: "Mobile App Key",
    key: "sk_live_98765432109876543210987654321098765432",
    description: "API key para la aplicación móvil",
    permissions: "read",
    createdAt: new Date("2024-01-20"),
    lastUsed: new Date("2024-01-31"),
    status: "active",
  },
  {
    id: 3,
    name: "Testing Key",
    key: "sk_test_abcdefghijklmnopqrstuvwxyz1234567890",
    description: "API key para pruebas de desarrollo",
    permissions: "write",
    createdAt: new Date("2024-01-10"),
    lastUsed: null,
    status: "revoked",
  },
]

export default function ApiKeysPage() {
  //const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())
  const [copiedKey, setCopiedKey] = useState<number | null>(null)
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null)

  const [keyForm, setKeyForm] = useState({
    name: "",
    description: "",
    permissions: "read" as "read" | "write" | "admin",
  })

  useEffect(() => {
    const loadApiKeys = async () => {
      const res = await apiClient.get("/ApiKey/apikeys")
      if (res.success && (res.data as any)?.data) {
        // res.data.data expected
        setApiKeys((res.data as any).data)
      } else if (res.success && Array.isArray(res.data)) {
        setApiKeys(res.data as any)
      } else {
        console.error("❌ Error al cargar API Keys:", res.error)
      }
    }

    loadApiKeys()
  }, [])

  const generateApiKey = () => {
    const prefix =
      keyForm.permissions === "admin" ? "sk_live" : keyForm.permissions === "write" ? "sk_write" : "sk_read"
    const randomString = Array.from({ length: 40 }, () =>
      "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36)),
    ).join("")
    return `${prefix}_${randomString}`
  }

  // const handleCreateApiKey = () => {
  //   if (!keyForm.name.trim()) {
  //     alert("Por favor ingresa un nombre para la API key")
  //     return
  //   }

  //   const newKey = generateApiKey()
  //   const newApiKey: ApiKey = {
  //     id: Math.max(...apiKeys.map((k) => k.id), 0) + 1,
  //     name: keyForm.name,
  //     key: newKey,
  //     description: keyForm.description,
  //     permissions: keyForm.permissions,
  //     createdAt: new Date(),
  //     lastUsed: null,
  //     status: "active",
  //   }

  //   setApiKeys([newApiKey, ...apiKeys])
  //   setNewKeyGenerated(newKey)
  //   setKeyForm({ name: "", description: "", permissions: "read" })
  // }

  const handleCreateApiKey = async () => {
  if (!keyForm.name.trim()) {
    alert("Por favor ingresa un nombre para la API key")
    return
  }

  const newKey = generateApiKey()

  const res = await apiClient.post("/ApiKey/apikeys", {
    nombre: keyForm.name,
    direccion: newKey,
  })

  if (res.success) {
    setApiKeys([{ id: Date.now(), nombre: keyForm.name, direccion: newKey, ...keyForm } as any, ...apiKeys])
    setNewKeyGenerated(newKey)
    setKeyForm({ name: "", description: "", permissions: "read" })
  } else {
    alert("Error al guardar la clave en el servidor")
  }
}

  const handleDeleteApiKey = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta API key? Esta acción no se puede deshacer.")) {
      setApiKeys(apiKeys.filter((k) => k.id !== id))
    }
  }

  const handleRevokeApiKey = (id: number) => {
    setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)))
  }

  const toggleKeyVisibility = (id: number) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = async (key: string, id: number) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedKey(id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      alert("Error al copiar la clave")
    }
  }

  const maskApiKey = (key: string) => {
    const parts = key.split("_")
    if (parts.length >= 2) {
      return `${parts[0]}_${parts[1]}_${"•".repeat(20)}${key.slice(-4)}`
    }
    return `${"•".repeat(key.length - 4)}${key.slice(-4)}`
  }

  const closeNewKeyDialog = () => {
    setNewKeyGenerated(null)
    setIsAddDialogOpen(false)
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "admin":
        return "destructive"
      case "write":
        return "default"
      case "read":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader currentPage="api-key" />
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-balance">Gestión de API Keys</h1>
          <p className="text-muted-foreground text-pretty">
            Administra las claves de API para integrar servicios externos de forma segura.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {apiKeys.filter((k) => k.status === "active").length} claves activas
            </span>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crear API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              {!newKeyGenerated ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva API Key</DialogTitle>
                    <DialogDescription>Define los permisos y el propósito de esta clave de API</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre de la clave</Label>
                      <Input
                        id="name"
                        value={keyForm.name}
                        onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                        placeholder="Production API Key"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="permissions">Permisos</Label>
                      <Select
                        value={keyForm.permissions}
                        onValueChange={(value: "read" | "write" | "admin") =>
                          setKeyForm({ ...keyForm, permissions: value })
                        }
                      >
                        <SelectTrigger id="permissions">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Solo lectura</SelectItem>
                          <SelectItem value="write">Lectura y escritura</SelectItem>
                          <SelectItem value="admin">Administrador (acceso completo)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {keyForm.permissions === "read" && "Permite solo consultar datos"}
                        {keyForm.permissions === "write" && "Permite consultar y modificar datos"}
                        {keyForm.permissions === "admin" && "Acceso completo a todas las operaciones"}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción (opcional)</Label>
                      <Textarea
                        id="description"
                        value={keyForm.description}
                        onChange={(e) => setKeyForm({ ...keyForm, description: e.target.value })}
                        placeholder="Describe el propósito de esta API key..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateApiKey}>Generar API Key</Button>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>API Key Creada Exitosamente</DialogTitle>
                    <DialogDescription>
                      Guarda esta clave en un lugar seguro. No podrás verla nuevamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-sm font-mono break-all">{newKeyGenerated}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(newKeyGenerated, -1)}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                      <p className="text-sm text-yellow-600 dark:text-yellow-500">
                        <strong>Importante:</strong> Esta es la única vez que verás esta clave completa. Asegúrate de
                        copiarla y guardarla en un lugar seguro.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={closeNewKeyDialog}>Entendido</Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                      <Badge variant={getPermissionColor(apiKey.permissions)}>
                        {apiKey.permissions === "admin"
                          ? "Admin"
                          : apiKey.permissions === "write"
                            ? "Lectura/Escritura"
                            : "Solo lectura"}
                      </Badge>
                      <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>
                        {apiKey.status === "active" ? "Activa" : "Revocada"}
                      </Badge>
                    </div>
                    {apiKey.description && <p className="text-sm text-muted-foreground">{apiKey.description}</p>}
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono flex-1 break-all">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                    </code>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="h-8 w-8"
                      >
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="h-8 w-8"
                      >
                        {copiedKey === apiKey.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span>Creada: {apiKey.createdAt.toLocaleDateString("es-ES")}</span>
                    <span>Último uso: {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString("es-ES") : "Nunca"}</span>
                  </div>
                  <div className="flex gap-2">
                    {apiKey.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeApiKey(apiKey.id)}
                        className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                      >
                        Revocar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {apiKeys.length === 0 && (
          <Card className="p-12 text-center">
            <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">Crea tu primera API key para comenzar</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear API Key
            </Button>
          </Card>
        )}
      </main>
    </div>
  )
}
