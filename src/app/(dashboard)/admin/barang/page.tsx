import { Metadata } from "next"
import { BarangClient } from "./barang-client"

export const metadata: Metadata = {
  title: "Barang - Admin",
  description: "Manajemen barang dalam sistem inventaris",
}

export default function BarangPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Barang</h1>
        <p className="text-muted-foreground">
          Kelola barang dalam sistem inventaris
        </p>
      </div>
      <BarangClient />
    </div>
  )
} 