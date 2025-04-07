// TODO: Pastikan komponen MaintenanceClient ada dan path impornya benar.
// Jika ada di (dashboard)/user/maintenance/maintenance-client.tsx, impornya mungkin:
// import { MaintenanceClient } from "./maintenance-client";
// Jika ada di src/components/..., impornya mungkin:
// import { MaintenanceClient } from "@/components/maintenance-client";
// Placeholder sementara:
const MaintenanceClient = ({ kategoriList }: any) => <div>Maintenance Client Placeholder (Kategori: {JSON.stringify(kategoriList)})</div>;

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MaintenancePage() {
  const kategori = await prisma.kategori.findMany({
    orderBy: {
      namaKategori: "asc",
    },
  })

  return (
    // DashboardShell/Header mungkin perlu ditambahkan jika ingin konsisten dengan halaman request
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Request Maintenance</h2>
      </div>
      <MaintenanceClient kategoriList={kategori} />
    </div>
  );
} 