"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BarangDialog } from "./barang-dialog"
import { BarangTable } from "./barang-table"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface Kategori {
  id: string
  namaKategori: string
}

interface Barang {
  id: string
  nama: string
  kategoriId: string
  kategori: Kategori
  _count: {
    seri: number
  }
}

interface BarangWithRelations extends Barang {
  kategori: Kategori
  _count: {
    seri: number
  }
}

export function BarangClient() {
  const router = useRouter()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBarang, setSelectedBarang] = useState<BarangWithRelations | null>(null)
  const queryClient = useQueryClient()

  const { data: barangData, isLoading: isLoadingBarang } = useQuery<BarangWithRelations[]>({
    queryKey: ["barang"],
    queryFn: async () => {
      const response = await fetch("/api/barang")
      if (!response.ok) {
        throw new Error("Gagal mengambil data barang")
      }
      return response.json()
    },
  })

  const { data: kategoriData, isLoading: isLoadingKategori } = useQuery<Kategori[]>({
    queryKey: ["kategori"],
    queryFn: async () => {
      const response = await fetch("/api/kategori")
      if (!response.ok) {
        throw new Error("Gagal mengambil data kategori")
      }
      return response.json()
    },
  })

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["barang"] })
    queryClient.invalidateQueries({ queryKey: ["kategori"] })
  }

  const handleDelete = async () => {
    if (!selectedBarang) return

    try {
      const response = await fetch(`/api/barang/${selectedBarang.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Barang berhasil dihapus")
        invalidateRelatedQueries()
        setShowDeleteDialog(false)
        setSelectedBarang(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`Gagal menghapus barang: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting barang:", error)
      toast.error("Terjadi kesalahan saat menghapus barang")
    } finally {
      setShowDeleteDialog(false)
      setSelectedBarang(null)
    }
  }

  const handleEditSuccess = () => {
    toast.success("Barang berhasil diperbarui")
    invalidateRelatedQueries()
  }

  const handleAddSuccess = () => {
    toast.success("Barang berhasil ditambahkan")
    invalidateRelatedQueries()
  }

  if (isLoadingBarang || isLoadingKategori) {
    return <div>Memuat data...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Barang
          </Button>
        </div>
      </div>
      <BarangTable
        data={barangData || []}
        isLoading={isLoadingBarang}
        onEdit={(barang) => {
          setSelectedBarang(barang as BarangWithRelations)
          setShowEditDialog(true)
        }}
        onDelete={(barang) => {
          setSelectedBarang(barang as BarangWithRelations)
          setShowDeleteDialog(true)
        }}
      />
      <BarangDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
        kategori={kategoriData || []}
      />
      <BarangDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setSelectedBarang(null)
        }}
        barang={selectedBarang}
        onSuccess={handleEditSuccess}
        kategori={kategoriData || []}
      />
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open)
          if (!open) setSelectedBarang(null)
        }}
        title="Hapus Barang"
        description={`Apakah Anda yakin ingin menghapus barang "${selectedBarang?.nama || ''}" ? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
    </>
  )
} 