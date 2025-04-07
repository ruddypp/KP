import { Metadata } from "next"
import { KategoriClient } from "./kategori-client"

export const metadata: Metadata = {
  title: "Kategori - Admin",
  description: "Manajemen kategori barang",
}

export default function KategoriPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
        <p className="text-muted-foreground">
          Kelola kategori barang dalam sistem inventaris
        </p>
      </div>
      <KategoriClient />
    </div>
  )
} 