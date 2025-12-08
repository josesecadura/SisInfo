"use client"

import { userService, User } from "@/lib/api/services/user.service"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Eye, EyeOff } from "lucide-react"
import { ErrorDialog } from "@/components/error-dialog"
import { SuccessDialog } from "@/components/success-dialog"
import Image from "next/image"
import { ProfileHeader } from "./components/ProfileHeader"
import { ListsSection } from "./components/ListsSection"
import { CommentsSection } from "./components/CommentsSection"
import { AuthRequired } from "@/components/auth-required"

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", message: "" })
  const [successDialog, setSuccessDialog] = useState({ open: false, title: "", message: "" })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [form, setForm] = useState({ username: "", fullName: "", email: "", bio: "", avatar: "" })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Función para validar si el username ya existe (solo al guardar)
  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username || username === profile?.username) {
      return true
    }

    try {
      const response = await userService.userNameExists(username)
      const exists = (response.data || response) as boolean
      
      if (exists) {
        setUsernameError("Este nombre de usuario ya está en uso")
        return false
      } else {
        setUsernameError(null)
        return true
      }
    } catch (error) {
      console.error("Error validando username:", error)
      setUsernameError("Error al validar nombre de usuario")
      return false
    }
  }

  const mapToProfile = (raw: any): User => {
    if (!raw) return {
      id: "0",
      username: "unknown",
      email: "",
      fullName: "",
      role: "user",
      createdAt: new Date().toISOString(),
    }

    return {
      id: raw.id != null ? String(raw.id) : raw.Id != null ? String(raw.Id) : raw.userId ?? "0",
      username: raw.username ?? raw.userName ?? raw.user ?? raw.Nombre ?? raw.realName ?? raw.name ?? "user",
      email: raw.email ?? raw.correo ?? "",
      fullName: raw.fullName ?? raw.realName ?? raw.real_name ?? "",
      avatar: (() => {
        const rawAvatar = raw.avatar ?? raw.foto ?? raw.photo ?? raw.profile_path ?? raw.image ?? undefined
        if (!rawAvatar) return undefined
        try {
          const s = String(rawAvatar)
          if (s.startsWith("data:image")) return s
          if (s.includes("imgres") || s.includes("imgurl=")) {
            const qIndex = s.indexOf("?")
            if (qIndex >= 0) {
              const qs = s.substring(qIndex + 1)
              const params = new URLSearchParams(qs)
              const img = params.get("imgurl")
              if (img) return decodeURIComponent(img)
            }
          }
          if (s.startsWith("/")) return `https://image.tmdb.org/t/p/w300${s}`
          if (s.startsWith("http://") || s.startsWith("https://")) return s
          return undefined
        } catch (e) {
          console.error("Error parsing avatar:", e)
          return undefined
        }
      })(),
      role: raw.role ?? (raw.boolAdmin ? "admin" : "user"),
      bio: raw.bio ?? raw.descripcion ?? raw.description ?? undefined,
      createdAt: raw.createdAt ?? raw.created_at ?? raw.fecha ?? new Date().toISOString(),
      followers: raw.followers ?? raw.seguidores ?? raw.numSeguidores ?? 0,
      following: raw.following ?? raw.seguidos ?? raw.numSeguidos ?? 0,
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("fylt_user")
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              const needsBio = !parsed.descripcion && !parsed.bio && !parsed.foto && !parsed.avatar
              if (needsBio) {
                try {
                  const usersRes = await userService.getAll()
                  const anyUsers = usersRes as any
                  const list = anyUsers?.data?.data ?? anyUsers?.data ?? anyUsers
                  if (Array.isArray(list) && list.length > 0) {
                    const found = list.find((u: any) => {
                      return (
                        (parsed.username && (u.username === parsed.username || u.userName === parsed.username)) ||
                        (parsed.email && u.email === parsed.email)
                      )
                    })
                    if (found) {
                      const merged = { ...parsed, ...found }
                      setProfile(mapToProfile(merged))
                      return
                    }
                  }
                } catch (e) {
                  // Empty catch block
                }
              }
              setProfile(mapToProfile(parsed))
              return
            } catch (e) {
              // Empty catch block
            }
          }
        }

        const res = await userService.getProfile()
        const anyRes = res as any
        const payload = anyRes?.data?.data ?? anyRes?.data ?? anyRes
        if (payload) {
          setProfile(mapToProfile(payload))
          return
        }

        try {
          const usersRes = await userService.getAll()
          const anyUsers = usersRes as any
          const list = anyUsers?.data?.data ?? anyUsers?.data ?? anyUsers
          if (Array.isArray(list) && list.length > 0) {
            const u = list[0]
            setProfile(mapToProfile(u))
          }
        } catch (e) {
          // Empty catch block
        }
      } catch (err) {
        console.error("Error cargando perfil:", err)
      }
    }

    loadProfile()
  }, [])

  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('La imagen debe ser menor a 5MB')
          return
        }
        if (!file.type.startsWith('image/')) {
          alert('Por favor selecciona una imagen válida')
          return
        }
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setAvatarPreview(result)
          setForm(prev => ({ ...prev, avatar: result }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSaveProfile = async () => {
    if (!profile?.id) return;

    // Validar username antes de guardar solo si cambió
    if (form.username !== profile?.username) {
      const isValid = await validateUsername(form.username)
      if (!isValid) {
        setErrorDialog({
          open: true,
          title: "Username no válido",
          message: usernameError || "El nombre de usuario ya está en uso"
        })
        return
      }
    }

    const optimisticProfile: User = {
      ...profile,
      username: form.username,
      fullName: form.fullName,
      email: form.email,
      bio: form.bio,
      avatar: form.avatar || profile.avatar,
      followers: profile.followers,
      following: profile.following,
    };

    setProfile(optimisticProfile);

    const payload = {
      id: profile.id,
      username: form.username,
      email: form.email,
      descripcion: form.bio,
      foto: form.avatar,
      realName: form.fullName,
      seguidores: profile.followers ?? 0,
      seguidos: profile.following ?? 0,
    };

    try {
      await userService.update(profile.id, payload);

      try {
        const stored = localStorage.getItem("fylt_user");
        const prevRaw = stored ? JSON.parse(stored) : {};
        const mergedRaw = { ...prevRaw, ...payload };
        localStorage.setItem("fylt_user", JSON.stringify(mergedRaw));
      } catch (e) {
        console.error("Error actualizando localStorage:", e);
      }
    } catch (err) {
      console.error("Error actualizando perfil en backend:", err);
    } finally {
      setEditOpen(false);
    }
  }

  const handleChangePassword = async () => {
    try {
      if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setErrorDialog({
          open: true,
          title: "Campos incompletos",
          message: "Todos los campos son obligatorios"
        })
        return
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setErrorDialog({
          open: true,
          title: "Contraseñas no coinciden",
          message: "Las contraseñas nuevas no coinciden"
        })
        return
      }
      
      if (passwordForm.newPassword.length < 6) {
        setErrorDialog({
          open: true,
          title: "Contraseña muy corta",
          message: "La nueva contraseña debe tener al menos 6 caracteres"
        })
        return
      }
      
      if (!profile?.id) {
        setErrorDialog({
          open: true,
          title: "Error de usuario",
          message: "ID de usuario no disponible"
        })
        return
      }
      
      const response = await userService.changePassword(
        profile.id, 
        passwordForm.oldPassword, 
        passwordForm.newPassword
      )
      
      const apiResponse = (response.data || response) as any
      
      if (apiResponse?.success === true && apiResponse?.statusCode === 200) {
        setSuccessDialog({
          open: true,
          title: "Contraseña actualizada",
          message: apiResponse?.message || "Contraseña actualizada correctamente"
        })
        setChangePasswordOpen(false)
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const errorMsg = apiResponse?.message || "Error, la contraseña no es correcta"
        setErrorDialog({
          open: true,
          title: "Error al cambiar contraseña",
          message: errorMsg
        })
      }
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error)
      
      let errorMsg = "Error al cambiar la contraseña"
      let errorTitle = "Error"
      
      if (error?.response?.status === 400) {
        const backendResponse = error?.response?.data
        if (backendResponse?.message) {
          errorMsg = backendResponse.message
          errorTitle = "Contraseña incorrecta"
        } else {
          errorMsg = "Datos inválidos o contraseña actual incorrecta"
        }
      } else if (error?.response?.status === 404) {
        errorMsg = "Usuario no encontrado"
        errorTitle = "Usuario no encontrado"
      } else if (error?.response?.status === 500) {
        const backendResponse = error?.response?.data
        errorMsg = backendResponse?.message || "Error interno del servidor"
        errorTitle = "Error del servidor"
      } else if (error?.message) {
        errorMsg = error.message
      }
      
      setErrorDialog({
        open: true,
        title: errorTitle,
        message: errorMsg
      })
    }
  }

  return (
    <AuthRequired>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Profile Header */}
        <ProfileHeader 
        profile={profile} 
        onEditClick={() => {
          setForm({
            username: profile?.username ?? "",
            fullName: profile?.fullName ?? "",
            email: profile?.email ?? "",
            bio: profile?.bio ?? "",
            avatar: profile?.avatar ?? "",
          })
          setAvatarFile(null)
          setAvatarPreview(profile?.avatar ?? null)
          setEditOpen(true)
        }} 
      />

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => setEditOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Nombre completo <span className="text-xs text-muted-foreground">(realName)</span></label>
              <Input value={form.fullName} onChange={(e: any) => setForm((s) => ({ ...s, fullName: e.target.value }))} placeholder="Nombre completo" />
            </div>

            <div>
              <label className="text-sm font-medium">Username <span className="text-xs text-muted-foreground">(username)</span></label>
              <Input 
                value={form.username} 
                onChange={(e: any) => {
                  setForm((s) => ({ ...s, username: e.target.value }))
                  if (usernameError) {
                    setUsernameError(null)
                  }
                }}
                placeholder="Username"
                className={usernameError ? "border-red-500" : ""}
              />
              {usernameError && (
                <p className="text-xs text-red-500 mt-1">{usernameError}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Email <span className="text-xs text-muted-foreground">(solo lectura)</span></label>
              <Input value={form.email} readOnly className="bg-muted/50" placeholder="Email" />
            </div>

            <div>
              <label className="text-sm font-medium">Avatar <span className="text-xs text-muted-foreground">(foto)</span></label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                    {(avatarPreview || form.avatar) ? (
                      <Image 
                        src={avatarPreview || form.avatar} 
                        alt="Preview avatar" 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAvatarUpload}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir foto
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setForm(s => ({ ...s, avatar: "" }))
                        setAvatarFile(null)
                        setAvatarPreview(null)
                      }}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar foto
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Tamaño máximo: 5MB. Formatos: JPG, PNG, WebP
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Biografía <span className="text-xs text-muted-foreground">(descripcion)</span></label>
              <Textarea value={form.bio} onChange={(e: any) => setForm((s) => ({ ...s, bio: e.target.value }))} placeholder="Biografía" />
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button variant="outline" onClick={() => {
                setEditOpen(false)
                setChangePasswordOpen(true)
              }}>Cambiar Contraseña</Button>
              <Button onClick={handleSaveProfile}>Guardar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={(o) => setChangePasswordOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Contraseña actual</label>
              <div className="relative">
                <Input 
                  type={showOldPassword ? "text" : "password"} 
                  value={passwordForm.oldPassword} 
                  onChange={(e) => setPasswordForm(s => ({ ...s, oldPassword: e.target.value }))}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nueva contraseña</label>
              <div className="relative">
                <Input 
                  type={showNewPassword ? "text" : "password"} 
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm(s => ({ ...s, newPassword: e.target.value }))}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar nueva contraseña</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm(s => ({ ...s, confirmPassword: e.target.value }))}
                  placeholder="Confirma tu nueva contraseña"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => {
                setChangePasswordOpen(false)
                setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
              }}>Cancelar</Button>
              <Button onClick={handleChangePassword}>Guardar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Listas Section */}
      {profile?.id && <ListsSection userId={profile.id} />}

      {/* Comentarios Section */}
      {profile?.id && <CommentsSection userId={profile.id} />}

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}
        title={errorDialog.title}
        description={errorDialog.message}
      />
      
      {/* Success Dialog */}
      <SuccessDialog
        open={successDialog.open}
        onOpenChange={(open) => setSuccessDialog(prev => ({ ...prev, open }))}
        title={successDialog.title}
        description={successDialog.message}
      />
      </div>
    </AuthRequired>
  )
}
