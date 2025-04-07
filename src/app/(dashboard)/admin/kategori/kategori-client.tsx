"use client"

import { useState } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KategoriDialog } from "./kategori-dialog"
import { KategoriTable } from "./kategori-table"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Kategori {
  id: string
  namaKategori: string
  totalUnit: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

const fetchKategori = async (): Promise<Kategori[]> => {
  const response = await fetch('/api/kategori')
  if (!response.ok) {
    throw new Error('Gagal mengambil data kategori')
  }
  const data: Kategori[] = await response.json()
  return data
}

const deleteKategori = async (id: string): Promise<void> => {
  const response = await fetch(`/api/kategori/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    let errorMessage = 'Gagal menghapus kategori.'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (e) {
      // Biarkan error message default jika parse gagal
    }
    throw new Error(errorMessage)
  }
}

export function KategoriClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null)

  const { data: kategoriData, isLoading, isError, error, isRefetching } = useQuery<Kategori[], Error>({
    queryKey: ['kategori'],
    queryFn: fetchKategori,
  })

  console.log("--- KategoriClient RENDER ---");
  console.log("isLoading:", isLoading);
  console.log("isError:", isError);
  console.log("kategoriData:", kategoriData);

  const deleteMutation = useMutation({
    mutationFn: deleteKategori,
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Kategori berhasil dihapus.",
      })
      queryClient.invalidateQueries({ queryKey: ['kategori'] })
      setShowDeleteDialog(false)
      setSelectedKategori(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus kategori.",
        variant: "destructive",
      })
      setShowDeleteDialog(false)
    },
  })

  const handleDeleteConfirm = () => {
    if (selectedKategori) {
      deleteMutation.mutate(selectedKategori.id)
    }
  }

  // Fungsi untuk refetch manual
  const handleRefetch = () => {
      queryClient.refetchQueries({ queryKey: ['kategori'] });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => setShowAddDialog(true)} disabled={isLoading || deleteMutation.isPending || isRefetching}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleRefetch} 
          disabled={isLoading || isRefetching}
          size="sm"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {isError && (
        <div className="text-red-600 mb-4">
          Error: {error?.message || "Gagal memuat data."}
        </div>
      )}

      <KategoriTable
        data={kategoriData ?? []}
        isLoading={isLoading || deleteMutation.isPending || isRefetching}
        onEdit={(kategori: Kategori) => {
          setSelectedKategori(kategori)
          setShowEditDialog(true)
        }}
        onDelete={(kategori: Kategori) => {
          setSelectedKategori(kategori)
          setShowDeleteDialog(true)
        }}
      />

      <KategoriDialog
        key={`add-${showAddDialog}`}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false)
          queryClient.invalidateQueries({ queryKey: ['kategori'] })
        }}
      />

      {selectedKategori && (
        <KategoriDialog
          key={`edit-${selectedKategori.id}-${showEditDialog}`}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          kategori={selectedKategori}
          onSuccess={() => {
            setShowEditDialog(false)
            setSelectedKategori(null)
            queryClient.invalidateQueries({ queryKey: ['kategori'] })
          }}
        />
      )}

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Kategori"
        description={`Apakah anda yakin ingin menghapus kategori "${selectedKategori?.namaKategori}"? Aksi ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
} 