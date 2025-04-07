"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Barang, SeriBarang } from "@prisma/client"

interface MaintenanceDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  barang: Barang | null | undefined
  seriBarang: SeriBarang | null | undefined
  mutate: () => void
}

export function MaintenanceDialog({
  open,
  setOpen,
  barang,
  seriBarang,
  mutate,
}: MaintenanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [alasan, setAlasan] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barangId: barang?.id,
          seriBarangId: seriBarang?.id,
          alasan,
        }),
      })

      if (!response.ok) {
        throw new Error()
      }

      toast.success("Request maintenance berhasil diajukan")
      mutate()
      setOpen(false)
    } catch /*(error)*/ {
      console.error("Error submitting maintenance request:")
      toast.error("Gagal mengajukan request maintenance")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Maintenance Barang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Barang</Label>
            <p className="text-sm text-muted-foreground">
              {barang?.nama} - {seriBarang?.serialNumber}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Maintenance</Label>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Masukkan alasan maintenance"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Ajukan Maintenance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 