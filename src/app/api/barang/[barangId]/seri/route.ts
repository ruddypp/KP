import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

// Handler untuk GET (ambil seri barang berdasarkan barangId)
export async function GET(req: Request, { params }: { params: { barangId: string } }) {
  const session = await getServerSession(authOptions);
  // Tidak perlu cek role spesifik? Asumsi admin & user bisa lihat seri?
  if (!session) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const barangId = params.barangId;
  if (!barangId) {
      return new NextResponse(JSON.stringify({ message: 'ID Barang diperlukan' }), { status: 400 });
  }

  try {
    const seriBarang = await prisma.seriBarang.findMany({
      where: { barangId: barangId },
      orderBy: {
        serialNumber: 'asc',
      },
      // Pilih field yang dibutuhkan saja
      select: {
          id: true,
          serialNumber: true,
          status: true,
          jumlah: true,
          // createdAt: true, // Opsional
      }
    });
    return NextResponse.json(seriBarang);
  } catch (error) {
    console.error(`Error fetching seri barang for barang ID ${barangId}:`, error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

// TODO: Tambahkan handler POST untuk menambah SeriBarang baru jika diperlukan
// export async function POST(req: Request, { params }: { params: { barangId: string } }) { ... } 