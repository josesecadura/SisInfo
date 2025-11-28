"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CreateListDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  newListName: string
  setNewListName: (name: string) => void
  newListImageFile: File | null
  setNewListImageFile: (file: File | null) => void
  isCreating?: boolean
  showImageUpload?: boolean
}

export function CreateListDialog({
  isOpen,
  onClose,
  onConfirm,
  newListName,
  setNewListName,
  newListImageFile,
  setNewListImageFile,
  isCreating = false,
  showImageUpload = true
}: CreateListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Lista</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input 
            value={newListName} 
            placeholder="Nombre de la lista" 
            onChange={(e) => setNewListName(e.target.value)}
            disabled={isCreating}
          />
          
          {showImageUpload && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagen de la lista</label>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById('list-file-input')?.click()}
                  disabled={isCreating}
                >
                  📁 Seleccionar imagen
                </Button>
                <span className="text-sm text-muted-foreground">
                  {newListImageFile ? newListImageFile.name : "Ningún archivo seleccionado"}
                </span>
              </div>
              <input 
                id="list-file-input"
                type="file" 
                accept="image/*" 
                onChange={(e) => setNewListImageFile(e.target.files?.[0] || null)} 
                className="hidden" 
                disabled={isCreating}
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isCreating}>
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={!newListName.trim() || isCreating}
            >
              {isCreating ? "Creando..." : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}