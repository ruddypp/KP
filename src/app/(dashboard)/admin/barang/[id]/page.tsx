import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SeriBarangClient } from "./seri-barang-client"

interface Barang {
  id: string
  nama: string
  kategori: {
    id: string
    namaKategori: string
  }
}

async function getBarang(id: string) {
  const barang = await prisma.barang.findUnique({
    where: { id },
    include: {
      kategori: true,
    },
  })

  if (!barang) {
    notFound()
  }

  return barang as Barang
}

/* --- Komentari sementara untuk diagnosis ---
export async function generateMetadata({
  params,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const barang = await getBarang(params.id);

  return {
    title: `Detail ${barang.nama}`,
    description: `Halaman detail barang ${barang.nama}`,
  };
}
--- Akhir Komentar Sementara --- */

export default async function DetailBarangPage({
  params,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const barang = await getBarang(params.id)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {barang.nama}
          </h2>
          <p className="text-muted-foreground">
            Kategori: {barang.kategori.namaKategori}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <SeriBarangClient barang={{
          id: barang.id,
          namaBarang: barang.nama,
          kategori: {
            id: barang.kategori.id,
            namaKategori: barang.kategori.namaKategori
          }
        }} />
      </div>
    </div>
  )
} 