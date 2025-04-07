"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { handleError } from "@/lib/error-handler"

interface MaintenanceDialogProps {
  isOpen: boolean
  onClose: () => void
  seriBarang: {
    id: string
    serialNumber: string
    barang: {
      nama: string
    }
  }
}

export function MaintenanceDialog({ isOpen, onClose, seriBarang }: MaintenanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [alasanPerbaikan, setAlasanPerbaikan] = useState("")
  const [keterangan, setKeterangan] = useState("")

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // Implementasi logika submit
      toast.success("Request maintenance berhasil diajukan")
      onClose()
    } catch (error) {
      handleError(error, "MaintenanceDialog")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Maintenance Barang</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Serial Number</Label>
            <p className="text-sm text-muted-foreground">{seriBarang.serialNumber}</p>
          </div>
          <div>
            <Label>Nama Barang</Label>
            <p className="text-sm text-muted-foreground">{seriBarang.barang.nama}</p>
          </div>
          <div>
            <Label>Alasan Perbaikan</Label>
            <Textarea
              value={alasanPerbaikan}
              onChange={(e) => setAlasanPerbaikan(e.target.value)}
              placeholder="Masukkan alasan perbaikan"
              required
            />
          </div>
          <div>
            <Label>Keterangan Tambahan</Label>
            <Textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Masukkan keterangan tambahan (opsional)"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Mengajukan..." : "Ajukan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 