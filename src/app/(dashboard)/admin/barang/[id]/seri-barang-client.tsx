"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SeriBarangDialog } from "./seri-barang-dialog"
import { SeriBarangTable } from "./seri-barang-table"
import { DeleteDialog } from "@/components/shared/delete-dialog"

interface Barang {
  id: string
  namaBarang: string
  kategori: {
    id: string
    namaKategori: string
  }
}

interface SeriBarangClientProps {
  barang: Barang
}

// Definisikan tipe untuk data seri yang dipilih
type SeriBarangSelection = {
  id: string;
  serialNumber: string; // Tambahkan serialNumber jika perlu untuk dialog hapus
  status: string; // Bisa diperketat jadi enum Status jika selalu dikirim
};

export function SeriBarangClient({ barang }: SeriBarangClientProps) {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedSeriBarang, setSelectedSeriBarang] = useState<SeriBarangSelection | null>(null)

  const onDelete = async () => {
    try {
      const res = await fetch(`/api/barang/seri?id=${selectedSeriBarang?.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success("Unit barang berhasil dihapus")
      router.refresh()
      setOpenDeleteDialog(false)
      setSelectedSeriBarang(null)
    } catch (error) {
      // Gunakan instanceof Error
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Daftar Unit Barang</h3>
          <p className="text-sm text-muted-foreground">
            Kelola unit barang inventaris
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Unit
        </Button>
      </div>
      <SeriBarangTable
        barangId={barang.id}
        onEdit={(seriBarang) => {
          setSelectedSeriBarang(seriBarang)
          setOpenDialog(true)
        }}
        onDelete={(seriBarang) => {
          setSelectedSeriBarang(seriBarang)
          setOpenDeleteDialog(true)
        }}
      />
      <SeriBarangDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedSeriBarang(null)
        }}
        seriBarang={selectedSeriBarang}
        barangId={barang.id}
      />
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false)
          setSelectedSeriBarang(null)
        }}
        onConfirm={onDelete}
        title="Hapus Unit Barang"
        description={`Apakah Anda yakin ingin menghapus unit barang ${selectedSeriBarang?.serialNumber || 'ini'}?`}
      />
    </>
  )
} 