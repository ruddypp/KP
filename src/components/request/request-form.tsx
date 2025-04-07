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
import { Input } from "@/components/ui/input";
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
  jumlah: number;
}

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  kategoriList: Kategori[];
}

export function RequestForm({
  isOpen,
  onClose,
  kategoriList,
}: RequestFormProps) {
  const router = useRouter();
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedBarang, setSelectedBarang] = useState("");
  const [selectedSeri, setSelectedSeri] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [barangList] = useState<Barang[]>([]);
  const [seriList] = useState<SeriBarang[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (/*!selectedBarang ||*/ !selectedSeri || !jumlah) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    try {
      const response = await fetch("/api/request/penggunaan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriId: selectedSeri,
          jumlah: parseInt(jumlah),
          keterangan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengajukan request");
      }

      toast.success("Berhasil mengajukan request");
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Penggunaan Barang</DialogTitle>
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
                      {seri.serialNumber} (Stok: {seri.jumlah})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                type="number"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                min={1}
                max={selectedSeri ? seriList.find(s => s.id === selectedSeri)?.jumlah : undefined}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Tambahkan keterangan penggunaan..."
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
            <Button type="submit">
              Kirim Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 