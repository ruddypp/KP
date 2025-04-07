import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface PdfExportProps {
  data: unknown[]
  columns: { header: string; dataKey: string }[]
  bulan?: string | null
  kategori?: string | null
}

export function PdfExport({ data, columns, bulan, kategori }: PdfExportProps) {
  const handleExport = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(16)
    doc.text("Laporan Aktivitas Inventaris", 14, 15)

    // Add filters info
    doc.setFontSize(10)
    if (bulan) {
      const date = new Date()
      date.setMonth(parseInt(bulan) - 1)
      doc.text(`Bulan: ${date.toLocaleString("id-ID", { month: "long" })}`, 14, 25)
    }
    if (kategori) {
      doc.text(`Kategori: ${kategori}`, 14, 30)
    }

    // Add table
    autoTable(doc, {
      head: [["User", "Aksi", "Detail", "Tanggal"]],
      body: data.map((item) => [
        item.user.name,
        item.aksi,
        item.detail,
        formatDate(item.createdAt),
      ]),
      startY: bulan || kategori ? 35 : 25,
    })

    // Save PDF
    doc.save("laporan-aktivitas.pdf")
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      Export PDF
    </Button>
  )
} 