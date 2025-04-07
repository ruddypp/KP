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
import { Check, X, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { formatDate } from "@/lib/utils"
import { RequestPenggunaan, User, SeriBarang, Barang, Kategori } from "@prisma/client"

// Definisikan tipe data request dengan relasi yang diperlukan
type RequestWithDetails = RequestPenggunaan & {
  user: User;
  seriBarang: SeriBarang & {
    barang: Barang & {
      kategori: Kategori;
    };
  };
};

interface RequestTableProps {
  data: RequestWithDetails[]; // Gunakan tipe yang sudah didefinisikan
}

export const RequestTable = ({ data }: RequestTableProps) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"
      case "APPROVED":
        return "bg-green-500"
      case "REJECTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAction = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    try {
      setLoading(true)
      const response = await fetch(`/api/request/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      })

      if (!response.ok) {
        throw new Error()
      }

      toast.success(
        `Permintaan berhasil ${action === "APPROVED" ? "disetujui" : "ditolak"}`
      )
      router.refresh()
    } catch /*(error)*/ {
      toast.error(
        `Gagal ${action === "APPROVED" ? "menyetujui" : "menolak"} permintaan`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/request/${selectedRequest?.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error()
      }

      toast.success("Permintaan berhasil dihapus")
      router.refresh()
    } catch /*(error)*/ {
      toast.error("Gagal menghapus permintaan")
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pemohon</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.user.name}</TableCell>
                <TableCell>
                  {item.seriBarang.barang.nama} (
                  {item.seriBarang.barang.kategori.namaKategori})
                </TableCell>
                <TableCell>{item.seriBarang.serialNumber}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {session?.user.role === "ADMIN" && item.status === "PENDING" && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(item.id, "APPROVED")}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAction(item.id, "REJECTED")}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {(session?.user.role === "ADMIN" ||
                    session?.user.id === item.userId) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(item)
                        setShowDeleteDialog(true)
                      }}
                      disabled={loading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title="Hapus Permintaan"
          description="Apakah Anda yakin ingin menghapus permintaan ini? Tindakan ini tidak dapat dibatalkan."
        />
    </>
  )
} 