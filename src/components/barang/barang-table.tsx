"use client";

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BarangDialog } from "./barang-dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Kategori } from "@prisma/client"

interface BarangWithStats {
  id: string;
  nama: string;
  kategoriId: string;
  kategori: Kategori;
  totalStok: number;
  statusCount: {
    available: number;
    used: number;
    maintenance: number;
  };
  _count: {
    seri: number;
  };
}

interface BarangTableProps {
  data: BarangWithStats[];
  kategori: Kategori[];
}

export const BarangTable = ({ data, kategori }: BarangTableProps) => {
  const router = useRouter()
  const [selectedBarang, setSelectedBarang] = useState<{
    id: string;
    nama: string;
    kategoriId: string;
  } | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const onDelete = async () => {
    if (!selectedBarang) return

    try {
      setIsLoading(true)
      await fetch(`/api/barang/${selectedBarang.id}`, {
        method: "DELETE",
      })
      toast.success("Barang berhasil dihapus")
      router.refresh()
    } catch /*(error)*/ {
      toast.error("Gagal menghapus barang")
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
      setSelectedBarang(null)
    }
  }

  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Total Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((barang) => (
              <>
                <TableRow key={barang.id}>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleRow(barang.id)}
                    >
                      {expandedRows.includes(barang.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{barang.nama}</TableCell>
                  <TableCell>{barang.kategori.namaKategori}</TableCell>
                  <TableCell>{barang.totalStok}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="success">
                        Available: {barang.statusCount.available}
                      </Badge>
                      <Badge variant="warning">
                        Used: {barang.statusCount.used}
                      </Badge>
                      <Badge variant="destructive">
                        Maintenance: {barang.statusCount.maintenance}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-x-2">
                      <Button
                        onClick={() => {
                          setSelectedBarang(barang)
                          setShowEditDialog(true)
                        }}
                        size="icon"
                        variant="ghost"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedBarang(barang)
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
                {expandedRows.includes(barang.id) && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">Detail Barang</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Seri
                            </p>
                            <p className="font-medium">{barang._count.seri}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Stok
                            </p>
                            <p className="font-medium">{barang.totalStok}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Status Breakdown
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                Available: {barang.statusCount.available}
                              </p>
                              <p className="text-sm">
                                Used: {barang.statusCount.used}
                              </p>
                              <p className="text-sm">
                                Maintenance: {barang.statusCount.maintenance}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      <BarangDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          setSelectedBarang(null)
        }}
        initialData={selectedBarang || undefined}
        kategori={kategori}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedBarang(null)
        }}
        onConfirm={onDelete}
        isLoading={isLoading}
        title="Hapus Barang"
        description="Apakah Anda yakin ingin menghapus barang ini?"
      />
    </>
  )
} 