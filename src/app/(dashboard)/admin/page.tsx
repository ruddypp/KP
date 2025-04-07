import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Impor ini mungkin perlu merujuk ke ../components/ jika komponen dashboard ada di (dashboard)/components
// atau @/components/dashboard jika sudah dipindah ke global
import { StatusPieChart } from "@/components/dashboard/status-pie-chart"
import { StatistikLineChart } from "@/components/dashboard/statistik-line-chart"
import { Box, FolderOpen, Users } from "lucide-react"
// Impor ini mungkin perlu merujuk ke ../components/ jika komponen layout ada di (dashboard)/components
// atau @/components/layout jika sudah dipindah ke global
import { DashboardShell } from "@/components/layout/shell"
import { DashboardHeader } from "@/components/layout/header"

export const metadata: Metadata = {
  title: "Dashboard - Admin",
  description: "Dashboard admin sistem inventaris barang",
}

// Perlu tipe data yang lebih spesifik untuk item
async function getOverviewData() {
  const [totalKategori, totalBarang, totalUser, statusData, chartData] = await Promise.all([
    prisma.kategori.count(),
    prisma.barang.count(),
    prisma.user.count(),
    prisma.seriBarang.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),
    prisma.logAktivitas.groupBy({
      by: ['timestamp'],
      _count: {
        id: true
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: 7,
    }),
  ])

  const pieData = statusData.map((item: { status: string, _count: { status: number } }) => ({ // Tambah tipe dasar
    name: item.status === 'AVAILABLE' ? 'Tersedia' :
          item.status === 'USED' ? 'Digunakan' :
          item.status === 'MAINTENANCE' ? 'Perbaikan' :
          'Rusak',
    value: item._count.status,
  }))

  const lineData = chartData.map((item: { timestamp: Date, _count: { id: number } }) => ({ // Tambah tipe dasar
    name: new Date(item.timestamp).toLocaleDateString('id-ID', { weekday: 'short' }),
    value: item._count.id,
  }))

  return {
    totalKategori,
    totalBarang,
    totalUser,
    pieData,
    lineData,
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/login") // Arahkan ke login jika tidak ada sesi
  }

  if (session.user.role !== "ADMIN") {
     redirect("/user") // Arahkan non-admin ke halaman user
  }

  const { totalKategori, totalBarang, totalUser, pieData, lineData } = await getOverviewData()

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Overview sistem inventaris barang"
      />
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKategori}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBarang}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUser}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Statistik Penggunaan</CardTitle>
            </CardHeader>
            <CardContent>
              <StatistikLineChart data={lineData} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Status Barang</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPieChart data={pieData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
} 