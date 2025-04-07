"use client";

import {
  // Hapus impor Card, CardContent, CardHeader, CardTitle
  // Card,
  // CardContent,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { ReactNode } from "react"

interface OverviewCardProps {
  title: string
  value: number
  icon: ReactNode
  description?: string
}

export function OverviewCard({
  title,
  value,
  icon,
  description,
}: OverviewCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
} 