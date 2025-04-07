"use client";

import { useState } from "react";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface Kategori {
  id: string;
  namaKategori: string;
}

interface MaintenanceRequest {
  id: string;
  barang: {
    nama: string;
    kategori: {
      namaKategori: string;
    };
  };
  seriBarang: {
    serialNumber: string;
  };
  alasan: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceClientProps {
  kategoriList: Kategori[];
}

export function MaintenanceClient({ kategoriList }: MaintenanceClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      const response = await fetch("/api/request/maintenance");
      if (!response.ok) throw new Error("Gagal mengambil data request");
      return response.json() as Promise<MaintenanceRequest[]>;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "yellow";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)}>
          Request Maintenance Baru
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal Request</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Alasan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terakhir Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : !requests?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Tidak ada request maintenance
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.createdAt), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{request.barang.nama}</TableCell>
                  <TableCell>{request.barang.kategori.namaKategori}</TableCell>
                  <TableCell>{request.seriBarang.serialNumber}</TableCell>
                  <TableCell>{request.alasan}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.updatedAt), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MaintenanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        kategoriList={kategoriList}
      />
    </>
  );
} 