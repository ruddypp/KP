"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Edit, Trash } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { KategoriDialog } from "./kategori-dialog"

interface KategoriTableProps {
  data: {
    id: string
    namaKategori: string
    _count: {
      barang: number
    }
  }[]
}

export const KategoriTable = ({ data }: KategoriTableProps) => {
  const router = useRouter()
  const [selectedKategori, setSelectedKategori] = useState<{
    id: string
    namaKategori: string
  } | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onDelete = async () => {
    if (!selectedKategori) return

    try {
      setIsLoading(true)
      await fetch(`/api/kategori/${selectedKategori.id}`, {
        method: "DELETE",
      })
      toast.success("Kategori berhasil dihapus")
      router.refresh()
    } catch /*(error)*/ {
      toast.error("Gagal menghapus kategori")
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setSelectedKategori(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Jumlah Barang</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((kategori) => (
              <TableRow key={kategori.id}>
                <TableCell>{kategori.namaKategori}</TableCell>
                <TableCell>{kategori._count.barang}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <Button
                      onClick={() => {
                        setSelectedKategori(kategori)
                        setShowEditDialog(true)
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedKategori(kategori)
                        setShowDeleteDialog(true)
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <KategoriDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          setSelectedKategori(null)
        }}
        initialData={selectedKategori || undefined}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedKategori(null)
        }}
        onConfirm={onDelete}
        isLoading={isLoading}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini?"
      />
    </>
  )
} 