"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { RequestForm } from "@/components/request/request-form";
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

interface Request {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  jumlah: number;
  keterangan?: string | null;
  createdAt: Date;
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
}

interface Kategori {
  id: string;
  namaKategori: string;
}

interface RequestClientProps {
  data: {
    requests: Request[];
    kategoriList: Kategori[];
  };
}

export function RequestClient({ data }: RequestClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Request</h2>
          <p className="text-muted-foreground">
            Total request: {data.requests.length}
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>Request Baru</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  {format(new Date(request.createdAt), "d MMMM yyyy", {
                    locale: id,
                  })}
                </TableCell>
                <TableCell>{request.barang.kategori.namaKategori}</TableCell>
                <TableCell>{request.barang.nama}</TableCell>
                <TableCell>{request.seri.serialNumber}</TableCell>
                <TableCell>{request.jumlah}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{request.keterangan || "-"}</TableCell>
              </TableRow>
            ))}
            {data.requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Belum ada request
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RequestForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        kategoriList={data.kategoriList}
      />
    </div>
  );
} 