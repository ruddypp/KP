"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

interface StatusPieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: {
    status: string
    _count: {
      status: number
    }
  }[]
}

const COLORS = {
  AVAILABLE: "#22c55e", // green-500
  USED: "#3b82f6", // blue-500
  MAINTENANCE: "#f59e0b", // amber-500
  DAMAGED: "#ef4444", // red-500
}

const STATUS_LABELS = {
  AVAILABLE: "Tersedia",
  USED: "Digunakan",
  MAINTENANCE: "Maintenance",
  DAMAGED: "Rusak",
}

export function StatusPieChart({
  data,
  className,
  ...props
}: StatusPieChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS],
    value: item._count.status,
    color: COLORS[item.status as keyof typeof COLORS],
  }))

  return (
    <Card className={cn("col-span-3", className)} {...props}>
      <CardHeader>
        <CardTitle>Status Barang</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center">
                            <div
                              className="mr-2 h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: payload[0].payload.color,
                              }}
                            />
                            <span className="text-sm">
                              {payload[0].payload.name}
                            </span>
                          </div>
                          <div className="text-sm font-medium">
                            {payload[0].value}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center">
              <div
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 