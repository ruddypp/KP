import { MaintenanceAdminClient } from "./maintenance-admin-client";
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MaintenanceAdminPage() {
  const kategori = await prisma.kategori.findMany({
    orderBy: {
      namaKategori: "asc",
    },
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Kelola Request Maintenance</h2>
      </div>
      <MaintenanceAdminClient kategoriList={kategori} />
    </div>
  );
} 