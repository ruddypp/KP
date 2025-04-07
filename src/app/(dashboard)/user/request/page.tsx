import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/layout/header";
import { DashboardShell } from "@/components/layout/shell";

// TODO: Pastikan komponen RequestClient ada dan path impornya benar.
// Jika ada di (dashboard)/user/request/request-client.tsx, impornya mungkin:
// import { RequestClient } from "./request-client"; 
// Jika ada di src/components/..., impornya mungkin:
// import { RequestClient } from "@/components/request-client"; 
// Placeholder sementara:
const RequestClient = ({ data }: any) => <div>Request Client Placeholder (Data: {JSON.stringify(data)})</div>;

export const metadata: Metadata = {
  title: "Request Penggunaan",
  description: "Manajemen request penggunaan barang",
};

// Definisikan tipe dasar untuk hasil include Prisma (sesuaikan jika perlu)
interface RequestWithDetails {
  id: string;
  status: string;
  alasan: string | null;
  createdAt: Date;
  seriBarang: {
    serialNumber: string;
    status: string; // Seharusnya enum Status dari Prisma
    barang: {
      nama: string;
      kategori: {
        namaKategori: string;
      };
    };
  };
}

async function getRequestData(userId: string) {
  const [requests, kategoriList] = await Promise.all([
    prisma.requestPenggunaan.findMany({
      where: {
        userId,
      },
      include: {
        seriBarang: {
          select: {
            serialNumber: true,
            status: true,
            barang: {
              select: {
                nama: true,
                kategori: {
                  select: {
                    namaKategori: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.kategori.findMany(),
  ]);

  // Gunakan tipe RequestWithDetails dan tambahkan any eksplisit untuk map
  const formattedRequests = (requests as RequestWithDetails[]).map((request: any) => ({
      id: request.id,
      status: request.status as "PENDING" | "APPROVED" | "REJECTED",
      jumlah: 1, // Assuming default value for jumlah
      keterangan: request.alasan,
      createdAt: request.createdAt,
      barang: request.seriBarang.barang,
      seri: {
        serialNumber: request.seriBarang.serialNumber,
        status: request.seriBarang.status, // Seharusnya enum Status
      },
    }));

  return {
    requests: formattedRequests,
    kategoriList,
  };
}

export default async function RequestPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }
  
  // Optional: Arahkan admin ke dashboard admin jika mereka masuk ke sini
  // if (session.user.role === 'ADMIN') { redirect('/admin'); }

  const data = await getRequestData(session.user.id);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Request Penggunaan"
        text="Ajukan dan lihat status request penggunaan barang"
      />
      <RequestClient data={data} />
    </DashboardShell>
  );
} 