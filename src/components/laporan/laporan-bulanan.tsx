import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Kategori } from "@prisma/client";

interface LaporanData {
  totalBarang: number;
  totalPeminjaman: number;
  totalMaintenance: number;
}

interface LaporanBulananProps {
  kategoriList: Kategori[];
}

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export function LaporanBulanan({ kategoriList }: LaporanBulananProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedKategori, setSelectedKategori] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<LaporanData | null>(null);

  const fetchLaporan = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        bulan: selectedMonth,
        ...(selectedKategori && { kategoriId: selectedKategori }),
      });

      const response = await fetch(`/api/laporan/bulanan?${params}`);
      if (!response.ok) throw new Error("Gagal mengambil data laporan");
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedKategori]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const barChartData = data
    ? [
        {
          name: "Total",
          Barang: data.totalBarang,
          Peminjaman: data.totalPeminjaman,
          Maintenance: data.totalMaintenance,
        },
      ]
    : [];

  const pieChartData = data
    ? [
        { name: "Barang", value: data.totalBarang },
        { name: "Peminjaman", value: data.totalPeminjaman },
        { name: "Maintenance", value: data.totalMaintenance },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded-md px-3 py-2"
        />
        <Select
          value={selectedKategori}
          onValueChange={setSelectedKategori}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Kategori</SelectItem>
            {kategoriList.map((kategori) => (
              <SelectItem key={kategori.id} value={kategori.id}>
                {kategori.namaKategori}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={fetchLaporan}
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Barang</CardTitle>
              <CardDescription>
                Periode: {format(new Date(selectedMonth), "MMMM yyyy", { locale: id })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Barang" fill="#22c55e" />
                    <Bar dataKey="Peminjaman" fill="#f59e0b" />
                    <Bar dataKey="Maintenance" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi</CardTitle>
              <CardDescription>
                Perbandingan jumlah barang, peminjaman, dan maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 