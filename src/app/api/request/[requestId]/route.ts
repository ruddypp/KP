import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"


export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { status, keterangan } = body

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid" },
        { status: 400 }
      )
    }

    // 1. Cari request yang akan diupdate, include relasi penting
    const requestToUpdate = await prisma.requestPenggunaan.findUnique({
      where: { id: params.requestId },
      include: {
        seriBarang: {
          include: {
            barang: true,
          },
        },
        user: true, // Include user untuk notifikasi jika perlu
      },
    });

    if (!requestToUpdate) {
      return NextResponse.json(
        { message: "Permintaan tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Update status dan alasan (bukan keterangan) request
    const updatedRequest = await prisma.requestPenggunaan.update({
      where: { id: params.requestId },
      data: {
        status,
        alasan: keterangan, // Ganti keterangan menjadi alasan
      },
      // Include lagi agar data yang dikembalikan lengkap
      include: {
        seriBarang: {
          include: {
            barang: true,
          },
        },
        user: true,
      },
    });

    // 3. Update stok jika status APPROVED
    if (status === "APPROVED") {
      // Asumsikan decrement selalu 1 karena jumlah tidak ada di RequestPenggunaan
      // Hapus pengecekan stok >= jumlah
      await prisma.seriBarang.update({
        where: { id: requestToUpdate.seriId }, // Ganti seriBarangId menjadi seriId
        data: {
          jumlah: {
            decrement: 1, // Asumsikan decrement 1
          },
          // Update status SeriBarang jika stok habis? (Misal: jika seriBarang.jumlah setelah decrement jadi 0)
          // status: ... (logika ini perlu diperjelas jika diperlukan)
        },
      });
      // Hapus blok else untuk stok tidak cukup karena pengecekan dihapus
    }

    // 4. Log aktivitas
    await prisma.logAktivitas.create({
      data: {
        userId: session.user.id,
        aksi: status === "APPROVED" ? "APPROVE_REQUEST" : "REJECT_REQUEST",
        detail: `${status === "APPROVED" ? "Menyetujui" : "Menolak"} permintaan penggunaan: ${requestToUpdate.seriBarang.barang.nama} (${requestToUpdate.seriBarang.serialNumber}) oleh ${requestToUpdate.user.name}. Alasan: ${keterangan || '-'} `,
        barangId: requestToUpdate.seriBarang.barangId,
        seriId: requestToUpdate.seriId, // Ganti seriBarangId menjadi seriId
      },
    });

    // 5. Trigger Pusher event
    await pusherServer.trigger("inventory", "request:update", {
      message: `Permintaan ${requestToUpdate.seriBarang.barang.nama} (${requestToUpdate.seriBarang.serialNumber}) ${status === "APPROVED" ? "disetujui" : "ditolak"}`,
      request: updatedRequest, // Kirim data request yang sudah diupdate
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("[REQUEST_PATCH]", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui permintaan" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const request = await prisma.requestPenggunaan.findUnique({
      where: {
        id: params.requestId,
      },
      include: {
        user: true,
        seriBarang: {
          include: {
            barang: true,
          },
        },
      },
    })

    if (!request) {
      return NextResponse.json(
        { message: "Permintaan tidak ditemukan" },
        { status: 404 }
      )
    }

    // Only admin or request owner can delete
    if (session.user.role !== "ADMIN" && request.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    const deletedRequest = await prisma.requestPenggunaan.delete({
      where: {
        id: params.requestId,
      },
    })

    // Log aktivitas
    await prisma.logAktivitas.create({
      data: {
        userId: session.user.id,
        aksi: "DELETE",
        detail: `Menghapus permintaan penggunaan: ${request.seriBarang.barang.nama} (${request.seriBarang.serialNumber})`,
        barangId: request.seriBarang.barang.id,
        seriId: request.seriBarang.id,
      },
    })

    // Trigger Pusher event
    await pusherServer.trigger("inventory", "request:delete", {
      message: `Permintaan penggunaan dihapus`,
      request,
    })

    return NextResponse.json(deletedRequest)
  } catch (error) {
    console.error("[REQUEST_DELETE]", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus permintaan" },
      { status: 500 }
    )
  }
} 