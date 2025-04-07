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

interface StokDialogProps {
  isOpen: boolean;
  onClose: () => void;
  seriId: string;
  serialNumber: string;
  currentStock: number;
  mode: "masuk" | "keluar";
}

export function StokDialog({
  isOpen,
  onClose,
  seriId,
  serialNumber,
  currentStock,
  mode,
}: StokDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jumlah || parseInt(jumlah) <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    if (mode === "keluar" && parseInt(jumlah) > currentStock) {
      toast.error("Stok tidak mencukupi");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/barang/stok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriId,
          [mode === "masuk" ? "stokMasuk" : "stokKeluar"]: parseInt(jumlah),
          keterangan,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal update stok");
      }

      toast.success(
        `Berhasil ${mode === "masuk" ? "menambah" : "mengurangi"} stok`
      );
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat update stok");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "masuk" ? "Tambah Stok" : "Kurangi Stok"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input value={serialNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label>Stok Saat Ini</Label>
              <Input value={currentStock} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                type="number"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                min={1}
                max={mode === "keluar" ? currentStock : undefined}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Tambahkan keterangan..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 