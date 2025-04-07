"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Kategori } from "@/types"

interface KategoriDialogProps {
  kategori?: Kategori
  children: React.ReactNode
}

export function KategoriDialog({ kategori, children }: KategoriDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [namaKategori, setNamaKategori] = useState(kategori?.namaKategori || "")
  const [error, setError] = useState("")

  const isEditing = !!kategori

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!namaKategori.trim()) {
      setError("Nama kategori tidak boleh kosong")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/kategori${isEditing ? `/${kategori.id}` : ""}`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaKategori: namaKategori.trim() }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast.success(
        isEditing ? "Kategori berhasil diubah" : "Kategori berhasil ditambahkan"
      )
      router.refresh()
      setOpen(false)
      setNamaKategori("")
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        setError("Nama kategori sudah digunakan")
        toast.error("Nama kategori sudah digunakan")
      } else {
        toast.error(
          isEditing
            ? "Gagal mengubah kategori"
            : "Gagal menambahkan kategori"
        )
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit nama kategori yang sudah ada"
              : "Tambah kategori baru untuk barang"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="namaKategori">Nama Kategori</Label>
              <Input
                id="namaKategori"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                placeholder="Masukkan nama kategori"
                disabled={loading}
                error={error}
              />
              {error && (
                <span className="text-sm text-red-500">{error}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setError("")
                if (!isEditing) setNamaKategori("")
              }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !namaKategori.trim()}>
              {loading ? "Menyimpan..." : isEditing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 