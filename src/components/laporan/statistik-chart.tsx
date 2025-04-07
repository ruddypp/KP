"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface StatistikChartProps {
  data: any[]
}

export function StatistikChart({ data }: StatistikChartProps) {
  // Hitung jumlah barang digunakan per minggu
  const penggunaanPerMinggu = data?.reduce((acc: any[], item: any) => {
    if (item.aksi === "APPROVE_REQUEST") {
      const date = new Date(item.createdAt)
      const week = `Minggu ${Math.ceil(date.getDate() / 7)}`
      const existingWeek = acc.find((w) => w.week === week)

      if (existingWeek) {
        existingWeek.jumlah += 1
      } else {
        acc.push({ week, jumlah: 1 })
      }
    }
    return acc
  }, [])

  // Hitung breakdown status
  const breakdownStatus = data?.reduce((acc: any[], item: any) => {
    if (item.aksi === "UPDATE_STATUS") {
      const status = item.detail.split(" ").pop()
      const existingStatus = acc.find((s) => s.status === status)

      if (existingStatus) {
        existingStatus.jumlah += 1
      } else {
        acc.push({ status, jumlah: 1 })
      }
    }
    return acc
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Penggunaan Barang per Minggu</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={penggunaanPerMinggu}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="jumlah"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Breakdown Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={breakdownStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 