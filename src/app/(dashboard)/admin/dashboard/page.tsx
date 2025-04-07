import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/layout/header"
import { DashboardShell } from "@/components/layout/shell"
import { OverviewCards } from "./overview-cards"
import { StatusPieChart } from "@/components/dashboard/status-pie-chart"
import { StatistikLineChart } from "@/components/dashboard/statistik-line-chart"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview sistem inventaris barang",
}

export default async function DashboardPage() {
  // Fetch data untuk overview cards
  const [totalKategori, totalBarang, totalSeriBarang] = await Promise.all([
    prisma.kategori.count(),
    prisma.barang.count(),
    prisma.seriBarang.count(),
  ])

  // Fetch data untuk status pie chart
  const statusCount = await prisma.seriBarang.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  })

  // Fetch data untuk statistik line chart (7 hari terakhir)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const dailyStats = await prisma.logAktivitas.groupBy({
    by: ["timestamp"],
    where: {
      timestamp: {
        gte: sevenDaysAgo,
      },
    },
    _count: {
      id: true,
    },
  })

  const statusData = statusCount.map(item => ({ name: item.status, value: item._count.status }));

  const chartData = dailyStats.map(item => ({ name: item.timestamp.toISOString(), value: item._count.id }));

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Overview sistem inventaris barang"
      />
      <div className="grid gap-4">
        <OverviewCards
          totalKategori={totalKategori}
          totalBarang={totalBarang}
          totalSeriBarang={totalSeriBarang}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <StatusPieChart data={statusData} className="col-span-3" />
          <StatistikLineChart data={chartData} className="col-span-4" />
        </div>
      </div>
    </DashboardShell>
  )
} 