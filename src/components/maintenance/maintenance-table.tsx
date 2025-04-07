"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { /*Check, X,*/ Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import { MaintenanceWithRelations } from "@/types";
import { pusherClient, CHANNELS, EVENTS } from "@/lib/pusher";

interface MaintenanceTableProps {
  data: MaintenanceWithRelations[];
}

export const MaintenanceTable = ({ data }: MaintenanceTableProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500";
      case "APPROVED":
        return "bg-green-500/10 text-green-500";
      case "REJECTED":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const handleAction = async (maintenanceId: string, action: "APPROVED" | "REJECTED") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/maintenance/${maintenanceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success(
        `Permintaan perbaikan berhasil ${action === "APPROVED" ? "disetujui" : "ditolak"}`
      );
      router.refresh();
    } catch (error) {
      toast.error(
        `Gagal ${action === "APPROVED" ? "menyetujui" : "menolak"} permintaan perbaikan`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaintenance) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/maintenance/${selectedMaintenance.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Permintaan perbaikan berhasil dihapus");
      router.refresh();
    } catch /*(error)*/ {
      toast.error("Gagal menghapus permintaan perbaikan");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setSelectedMaintenance(null);
    }
  };

  // Subscribe to maintenance updates
  useEffect(() => {
    const channel = pusherClient.subscribe(CHANNELS.REQUEST_UPDATES);
    channel.bind(EVENTS.REQUEST_UPDATED, () => {
      router.refresh();
    });

    return () => {
      channel.unbind(EVENTS.REQUEST_UPDATED);
      pusherClient.unsubscribe(CHANNELS.REQUEST_UPDATES);
    };
  }, [router]);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pemohon</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Alasan</TableHead>
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
                <TableCell>{item.alasanPerbaikan}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {session?.user.role === "ADMIN" && item.status === "PENDING" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(item.id, "APPROVED")}
                        disabled={loading}
                      >
                        Setujui
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(item.id, "REJECTED")}
                        disabled={loading}
                      >
                        Tolak
                      </Button>
                    </>
                  )}
                  {(session?.user.role === "ADMIN" ||
                    session?.user.id === item.userId) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedMaintenance(item);
                        setShowDeleteDialog(true);
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
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedMaintenance(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Permintaan Perbaikan"
        description="Apakah Anda yakin ingin menghapus permintaan perbaikan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </>
  );
}; 