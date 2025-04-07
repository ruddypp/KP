import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { pusherServer } from '@/lib/pusher';

// Skema validasi untuk data kategori baru
const kategoriSchema = z.object({
  namaKategori: z.string().min(1, { message: "Nama kategori tidak boleh kosong." })
});

// Interface untuk hasil query raw
interface KategoriWithTotalUnits {
  id: string;
  namaKategori: string;
  totalunits: bigint; 
  createdAt: Date;
  updatedAt: Date;
}

// Handler untuk GET (ambil semua kategori dengan total unit)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  // Meskipun middleware melindungi, cek role lagi untuk keamanan API
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Definisikan query SQL - gunakan string template biasa jika Prisma.sql error
    const query = `
      SELECT
        k.id,
        k."namaKategori",
        k."createdAt",
        k."updatedAt",
        COUNT(sb.id)::bigint AS totalunits
      FROM "Kategori" k
      LEFT JOIN "Barang" b ON k.id = b."kategoriId"
      LEFT JOIN "SeriBarang" sb ON b.id = sb."barangId"
      GROUP BY k.id, k."namaKategori", k."createdAt", k."updatedAt"
      ORDER BY k."namaKategori" ASC;
    `;

    // Jalankan query raw - tambahkan any jika tipe generic error
    const result = await prisma.$queryRawUnsafe<KategoriWithTotalUnits[]>(query);

    // Konversi BigInt ke Number dan buat objek baru
    const kategoriWithUnits = result.map((item: KategoriWithTotalUnits) => ({ // Beri tipe eksplisit
      id: item.id,
      namaKategori: item.namaKategori,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      totalUnit: Number(item.totalunits) 
    }));

    return NextResponse.json(kategoriWithUnits);

  } catch (error) {
    console.error("Error fetching kategori with total units:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

// Handler untuk POST (buat kategori baru)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = kategoriSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: 'Data tidak valid', errors: validation.error.errors }), { status: 400 });
    }

    const namaKategori = validation.data.namaKategori;

    const newKategori = await prisma.kategori.create({
      data: { namaKategori: namaKategori, },
    });

    // --- Log Aktivitas --- 
    try {
        await prisma.logAktivitas.create({
            data: {
                userId: session.user.id,
                aksi: 'CREATE_KATEGORI',
                detail: `Membuat kategori baru: ${namaKategori} (ID: ${newKategori.id})`,
            }
        });
    } catch (logError) {
        console.error("Gagal mencatat log aktivitas (Create Kategori):", logError);
    }
    // --------------------

    // --- Trigger Pusher --- 
     try {
        await pusherServer.trigger('admin-channel', 'kategori:created', { 
            message: `Kategori baru "${namaKategori}" ditambahkan.`,
            kategoriId: newKategori.id
        });
     } catch (pusherError) {
        console.error("Gagal trigger Pusher (Create Kategori):", pusherError);
     }
    // --------------------- 

    return NextResponse.json(newKategori, { status: 201 });
  } catch (error: any) {
     // Handle potensi error jika nama kategori unik
    if (error.code === 'P2002' && error.meta?.target?.includes('namaKategori')) {
      return new NextResponse(JSON.stringify({ message: 'Nama kategori sudah ada.' }), { status: 409 }); // 409 Conflict
    }
    console.error("Error creating kategori:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
} 