"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Kategori {
  id: string;
  namaKategori: string;
}

interface Barang {
  id: string;
  nama: string;
  kategoriId: string;
}

interface SeriBarang {
  id: string;
  serialNumber: string;
  status: string;
}

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  kategoriList: Kategori[];
}

export function MaintenanceForm({
  isOpen,
  onClose,
  kategoriList,
}: MaintenanceFormProps) {
  const router = useRouter();
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedBarang, setSelectedBarang] = useState("");
  const [selectedSeri, setSelectedSeri] = useState("");
  const [alasan, setAlasan] = useState("");
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [seriList, setSeriList] = useState<SeriBarang[]>([]);

  // Fetch barang berdasarkan kategori
  const fetchBarang = async (kategoriId: string) => {
    try {
      const response = await fetch(`/api/barang?kategoriId=${kategoriId}`);
      if (!response.ok) throw new Error("Gagal mengambil data barang");
      const data = await response.json();
      setBarangList(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data barang");
    }
  };

  // Fetch seri barang berdasarkan barang
  const fetchSeri = async (barangId: string) => {
    try {
      const response = await fetch(`/api/barang/seri?barangId=${barangId}&status=USED`);
      if (!response.ok) throw new Error("Gagal mengambil data seri barang");
      const data = await response.json();
      setSeriList(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data seri barang");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBarang || !selectedSeri || !alasan) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    try {
      const response = await fetch("/api/request/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barangId: selectedBarang,
          seriId: selectedSeri,
          alasan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengajukan request maintenance");
      }

      toast.success("Berhasil mengajukan request maintenance");
      router.refresh();
      onClose();
    } catch /*(error)*/ {
      console.error("Error submitting maintenance request:");
      toast.error("Gagal mengirim request maintenance");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Maintenance Barang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={selectedKategori}
                onValueChange={(value) => {
                  setSelectedKategori(value);
                  setSelectedBarang("");
                  setSelectedSeri("");
                  fetchBarang(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriList.map((kategori) => (
                    <SelectItem key={kategori.id} value={kategori.id}>
                      {kategori.namaKategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Barang</Label>
              <Select
                value={selectedBarang}
                onValueChange={(value) => {
                  setSelectedBarang(value);
                  setSelectedSeri("");
                  fetchSeri(value);
                }}
                disabled={!selectedKategori}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Barang" />
                </SelectTrigger>
                <SelectContent>
                  {barangList.map((barang) => (
                    <SelectItem key={barang.id} value={barang.id}>
                      {barang.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Select
                value={selectedSeri}
                onValueChange={setSelectedSeri}
                disabled={!selectedBarang}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Serial Number" />
                </SelectTrigger>
                <SelectContent>
                  {seriList.map((seri) => (
                    <SelectItem key={seri.id} value={seri.id}>
                      {seri.serialNumber} ({seri.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alasan">Alasan Maintenance</Label>
              <Textarea
                id="alasan"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan alasan mengapa barang perlu maintenance..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button type="submit">Kirim Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 