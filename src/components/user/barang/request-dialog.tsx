"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { handleError } from "@/lib/error-handler"

interface RequestDialogProps {
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

export function RequestDialog({ isOpen, onClose, seriBarang }: RequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [alasan, setAlasan] = useState("")

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // Implementasi logika submit
      toast.success("Request berhasil diajukan")
      onClose()
    } catch (error) {
      handleError(error, "RequestDialog")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Penggunaan Barang</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Serial Number</Label>
            <Input value={seriBarang.serialNumber} disabled />
          </div>
          <div>
            <Label>Nama Barang</Label>
            <Input value={seriBarang.barang.nama} disabled />
          </div>
          <div>
            <Label>Alasan Penggunaan</Label>
            <Textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Masukkan alasan penggunaan barang"
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