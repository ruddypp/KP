"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { LogAktivitasWithRelations } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ExportButtonProps {
  data: LogAktivitasWithRelations[];
  bulan: string;
}

export const ExportButton = ({ data, bulan }: ExportButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const exportData = data.map((item) => ({
        Tanggal: formatDate(item.timestamp),
        User: item.user.name,
        Aksi: item.aksi,
        "Nama Barang": item.barang?.nama || "-",
        "Kategori": item.barang?.kategori?.namaKategori || "-",
        "Serial Number": item.seriBarang?.serialNumber || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");

      XLSX.writeFile(wb, `Laporan_${bulan}.xlsx`);
      toast.success("Data berhasil diekspor ke Excel");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Mengekspor..." : "Export Excel"}
    </Button>
  );
}; 