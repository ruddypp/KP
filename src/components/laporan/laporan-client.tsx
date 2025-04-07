import { PdfExport } from "@/components/laporan/pdf-export"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { LogAktivitas as PrismaLogAktivitas } from "@/types"
import { toast } from "sonner"
import { format } from "date-fns"

export function LaporanClient(/*{ kategoriList }: LaporanClientProps*/) {
  const [logData, setLogData] = useState<PrismaLogAktivitas[]>([])
  const [selectedBulan, setSelectedBulan] = useState(
    format(new Date(), "yyyy-MM")
  )
  const [selectedKategori, setSelectedKategori] = useState("")

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedBulan) params.append("bulan", selectedBulan)
      if (selectedKategori) params.append("kategoriId", selectedKategori)

      const response = await fetch(`/api/export?type=activity&${params.toString()}`)
      if (!response.ok) throw new Error()

      const data = await response.json()
      setLogData(data)
    } catch (error) {
      toast.error("Gagal memuat data log aktivitas")
    }
  }, [selectedBulan, selectedKategori])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Handle Excel export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      params.append("type", "activity")
      if (selectedBulan) params.append("bulan", selectedBulan)
      if (selectedKategori) params.append("kategoriId", selectedKategori)

      const response = await fetch(`/api/export?${params.toString()}`)
      if (!response.ok) throw new Error()

      // Get filename from header or generate default
      const filename = response.headers.get("Content-Disposition")?.split("filename=")[1] || 
        `log_aktivitas_${format(new Date(), "yyyyMMdd")}.xlsx`

      // Convert response to blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Data berhasil diekspor ke Excel")
    } catch (error) {
      toast.error("Gagal mengekspor data")
    }
  }

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Laporan Aktivitas</h2>
        <div className="flex items-center gap-2">
          <PdfExport 
            data={logData} 
            bulan={selectedBulan} 
            kategori={selectedKategori} 
          />
          <Button 
            onClick={handleExport} 
            variant="outline" 
            size="sm"
          >
            Export Excel
          </Button>
        </div>
      </div>
    </div>
  )
} 