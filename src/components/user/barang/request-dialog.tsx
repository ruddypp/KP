"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface RequestDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  barang: any
  seriBarang: any
  mutate: () => void
}

export function RequestDialog({
  open,
  setOpen,
  barang,
  seriBarang,
  mutate,
}: RequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [jumlah, setJumlah] = useState("")
  const [alasan, setAlasan] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barangId: barang.id,
          seriBarangId: seriBarang.id,
          jumlah: parseInt(jumlah),
          alasan,
        }),
      })

      if (!response.ok) {
        throw new Error()
      }

      toast.success("Request penggunaan berhasil diajukan")
      mutate()
      setOpen(false)
    } catch /*(error)*/ {
      console.error("Error submitting request:")
      toast.error("Gagal mengajukan request penggunaan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Penggunaan Barang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Barang</Label>
            <p className="text-sm text-muted-foreground">
              {barang?.nama} - {seriBarang?.serialNumber}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              min={1}
              max={seriBarang?.jumlah}
              required
            />
            <p className="text-xs text-muted-foreground">
              Tersedia: {seriBarang?.jumlah}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Penggunaan</Label>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Masukkan alasan penggunaan"
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
              {isLoading ? "Memproses..." : "Ajukan Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 