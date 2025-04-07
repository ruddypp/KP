"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface MaintenanceRequest {
  id: string;
  user: {
    name: string;
    email: string;
  };
  barang: {
    nama: string;
    kategori: {
      namaKategori: string;
    };
  };
  seri: {
    serialNumber: string;
    status: string;
  };
  alasan: string;
  keterangan?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export function MaintenanceAdminClient() {
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const { data: requestsData, isLoading, error, refetch } = useQuery<MaintenanceRequest[]>({
    queryKey: ["maintenanceRequests"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance");
      if (!response.ok) throw new Error("Gagal mengambil data request");
      return response.json();
    },
  });

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/maintenance/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          keterangan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal memperbarui status");
      }

      toast.success(`Berhasil ${status === "APPROVED" ? "menyetujui" : "menolak"} request maintenance`);
      refetch();
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setKeterangan("");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error memuat data...</div>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsExportDialogOpen(true)}>
          Export Data
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal Request</TableHead>
              <TableHead>Pemohon</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Alasan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestsData?.map((request: MaintenanceRequest) => (
              <TableRow key={request.id}>
                <TableCell>
                  {request.createdAt}
                </TableCell>
                <TableCell>{request.user.name}</TableCell>
                <TableCell>{request.barang.nama}</TableCell>
                <TableCell>{request.barang.kategori.namaKategori}</TableCell>
                <TableCell>{request.seri.serialNumber}</TableCell>
                <TableCell>{request.alasan}</TableCell>
                <TableCell>
                  {request.status}
                </TableCell>
                <TableCell>
                  {request.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsDialogOpen(true);
                      }}
                    >
                      Tindak Lanjut
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tindak Lanjut Request Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pemohon</Label>
              <div>{selectedRequest?.user.name}</div>
            </div>
            <div className="space-y-2">
              <Label>Barang</Label>
              <div>{selectedRequest?.barang.nama}</div>
            </div>
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <div>{selectedRequest?.seri.serialNumber}</div>
            </div>
            <div className="space-y-2">
              <Label>Alasan</Label>
              <div>{selectedRequest?.alasan}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan (opsional)</Label>
              <Textarea
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Tambahkan keterangan..."
              />
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction("REJECTED")}
            >
              Tolak
            </Button>
            <Button
              onClick={() => handleAction("APPROVED")}
            >
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isExportDialogOpen && (
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>Fitur export data akan segera hadir!</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 