import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher"

type MaintenanceRow = {
  id: string;
  createdAt: Date;
  alasanPerbaikan: string;
  status: string;
  keterangan: string | null;
  userName: string;
  userEmail: string;
  barangNama: string;
  serialNumber: string;
  namaKategori: string | null;
  userId: string;
  seriBarangId: string;
  barangId: string;
};

export async function GET(
  req: Request,
  { params }: { params: { maintenanceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const maintenance = await prisma.$queryRaw<MaintenanceRow[]>`
      SELECT 
        m.id,
        m."createdAt",
        m."alasanPerbaikan",
        m.status,
        m.keterangan,
        m."userId",
        m."seriBarangId",
        u.name as "userName",
        u.email as "userEmail",
        b.id as "barangId",
        b.nama as "barangNama",
        s."serialNumber",
        k."namaKategori"
      FROM "RequestMaintenance" m
      JOIN "User" u ON m."userId" = u.id
      JOIN "SeriBarang" s ON m."seriBarangId" = s.id
      JOIN "Barang" b ON s."barangId" = b.id
      LEFT JOIN "Kategori" k ON b."kategoriId" = k.id
      WHERE m.id = ${params.maintenanceId}
    `

    if (!maintenance || maintenance.length === 0) {
      return NextResponse.json(
        { message: "Data maintenance tidak ditemukan" },
        { status: 404 }
      )
    }

    // Jika user bukan admin, pastikan hanya bisa lihat data miliknya
    if (session.user.role !== "ADMIN" && maintenance[0].userId !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(maintenance[0])
  } catch (error) {
    console.error("[MAINTENANCE_GET]", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { seriBarangId, alasanPerbaikan } = body

    if (!seriBarangId || !alasanPerbaikan) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if seriBarang exists
      const seriBarang = await tx.$queryRaw<{ id: string; barangId: string; serialNumber: string; barangNama: string }[]>`
        SELECT s.id, s."barangId", s."serialNumber", b.nama as "barangNama"
        FROM "SeriBarang" s
        JOIN "Barang" b ON s."barangId" = b.id
        WHERE s.id = ${seriBarangId}
      `

      if (!seriBarang || seriBarang.length === 0) {
        throw new Error("Barang tidak ditemukan")
      }

      // Create maintenance request
      const maintenance = await tx.$executeRaw`
        INSERT INTO "RequestMaintenance" ("id", "userId", "seriBarangId", "alasanPerbaikan", "status", "createdAt", "updatedAt")
        VALUES (${Prisma.sql`gen_random_uuid()`}, ${session.user.id}, ${seriBarangId}, ${alasanPerbaikan}, 'PENDING', NOW(), NOW())
        RETURNING *
      `

      // Log activity
      await tx.$executeRaw`
        INSERT INTO "LogAktivitas" ("id", "userId", "aksi", "detail", "barangId", "seriId", "timestamp")
        VALUES (
          ${Prisma.sql`gen_random_uuid()`},
          ${session.user.id},
          'MAINTENANCE',
          ${`Mengajukan permintaan perbaikan: ${seriBarang[0].barangNama} (${seriBarang[0].serialNumber})`},
          ${seriBarang[0].barangId},
          ${seriBarang[0].id},
          NOW()
        )
      `

      // Trigger Pusher event for POST
      await pusherServer.trigger(CHANNELS.REQUEST_UPDATES, EVENTS.REQUEST_UPDATED, {
        message: `Permintaan perbaikan baru dari ${session.user.name}`,
        maintenance: maintenance,
      })

      return maintenance
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[MAINTENANCE_POST]", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat permintaan" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { maintenanceId: string } }
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

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get maintenance data
      const maintenance = await tx.$queryRaw<MaintenanceRow[]>`
        SELECT 
          m.id,
          m."seriBarangId",
          b.id as "barangId",
          b.nama as "barangNama",
          s."serialNumber"
        FROM "RequestMaintenance" m
        JOIN "SeriBarang" s ON m."seriBarangId" = s.id
        JOIN "Barang" b ON s."barangId" = b.id
        WHERE m.id = ${params.maintenanceId}
      `

      if (!maintenance || maintenance.length === 0) {
        throw new Error("Permintaan maintenance tidak ditemukan")
      }

      // Update maintenance status
      await tx.$executeRaw`
        UPDATE "RequestMaintenance"
        SET status = ${status}, keterangan = ${keterangan}, "updatedAt" = NOW()
        WHERE id = ${params.maintenanceId}
      `

      // If approved, update seriBarang status
      if (status === "APPROVED") {
        await tx.$executeRaw`
          UPDATE "SeriBarang"
          SET status = 'MAINTENANCE', "updatedAt" = NOW()
          WHERE id = ${maintenance[0].seriBarangId}
        `
      }

      // Log activity
      await tx.$executeRaw`
        INSERT INTO "LogAktivitas" ("id", "userId", "aksi", "detail", "barangId", "seriId", "timestamp")
        VALUES (
          ${Prisma.sql`gen_random_uuid()`},
          ${session.user.id},
          ${status === "APPROVED" ? "APPROVE" : "REJECT"},
          ${`${status === "APPROVED" ? "Menyetujui" : "Menolak"} permintaan perbaikan: ${maintenance[0].barangNama} (${maintenance[0].serialNumber})`},
          ${maintenance[0].barangId},
          ${maintenance[0].seriBarangId},
          NOW()
        )
      `

      // Trigger Pusher event for PATCH
      await pusherServer.trigger(CHANNELS.REQUEST_UPDATES, EVENTS.REQUEST_UPDATED, {
        message: `Permintaan perbaikan ${status === "APPROVED" ? "disetujui" : "ditolak"}`,
        maintenance: maintenance[0],
      })

      return maintenance[0]
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[MAINTENANCE_PATCH]", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui permintaan" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { maintenanceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get maintenance data first
      const maintenance = await tx.$queryRaw<MaintenanceRow[]>`
        SELECT 
          m.id,
          m."userId",
          m."seriBarangId",
          b.id as "barangId",
          b.nama as "barangNama",
          s."serialNumber"
        FROM "RequestMaintenance" m
        JOIN "SeriBarang" s ON m."seriBarangId" = s.id
        JOIN "Barang" b ON s."barangId" = b.id
        WHERE m.id = ${params.maintenanceId}
      `

      if (!maintenance || maintenance.length === 0) {
        throw new Error("Permintaan maintenance tidak ditemukan")
      }

      // Only admin or maintenance owner can delete
      if (session.user.role !== "ADMIN" && maintenance[0].userId !== session.user.id) {
        throw new Error("Forbidden")
      }

      // Delete the maintenance request
      await tx.$executeRaw`
        DELETE FROM "RequestMaintenance"
        WHERE id = ${params.maintenanceId}
      `

      // Log activity
      await tx.$executeRaw`
        INSERT INTO "LogAktivitas" ("id", "userId", "aksi", "detail", "barangId", "seriId", "timestamp")
        VALUES (
          ${Prisma.sql`gen_random_uuid()`},
          ${session.user.id},
          'DELETE',
          ${`Menghapus permintaan perbaikan: ${maintenance[0].barangNama} (${maintenance[0].serialNumber})`},
          ${maintenance[0].barangId},
          ${maintenance[0].seriBarangId},
          NOW()
        )
      `

      // Trigger Pusher event for DELETE
      await pusherServer.trigger(CHANNELS.REQUEST_UPDATES, EVENTS.REQUEST_UPDATED, {
        message: `Permintaan perbaikan dihapus`,
        maintenance: maintenance[0],
      })

      return maintenance[0]
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[MAINTENANCE_DELETE]", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.message === "Forbidden" ? 403 : 400 }
      )
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus permintaan" },
      { status: 500 }
    )
  }
} 