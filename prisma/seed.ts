import { PrismaClient, Status, Role } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`);

  // Hapus data lama (urutkan dari model yang bergantung ke model yang tidak bergantung)
  console.log(`Deleting old data ...`);
  await prisma.logAktivitas.deleteMany();
  // await prisma.requestPenggunaan.deleteMany(); // Jika ada data request
  // await prisma.requestMaintenance.deleteMany(); // Jika ada data maintenance
  await prisma.seriBarang.deleteMany();
  await prisma.barang.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.user.deleteMany(); // Hati-hati jika tidak ingin menghapus semua user
  console.log(`Old data deleted.`);

  // Create admin user
  console.log(`Creating users ...`);
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@paramata.co.id" },
    update: {},
    create: {
      email: "admin@paramata.co.id",
      name: "Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  // Create regular user
  const userPassword = await hash("user123", 10)
  const user = await prisma.user.upsert({
    where: { email: "user@paramata.co.id" },
    update: {},
    create: {
      email: "user@paramata.co.id",
      name: "User",
      password: userPassword,
      role: Role.USER,
    },
  })

  // Create categories
  const laptopCategory = await prisma.kategori.upsert({
    where: { namaKategori: "Laptop" },
    update: {},
    create: {
      namaKategori: "Laptop",
    },
  })

  const printerCategory = await prisma.kategori.upsert({
    where: { namaKategori: "Printer" },
    update: {},
    create: {
      namaKategori: "Printer",
    },
  })

  // Create items and series
  const laptop = await prisma.barang.upsert({
    where: { id: 'clseed_laptop_thinkpad' },
    update: {
      nama: "ThinkPad X1",
      kategoriId: laptopCategory.id,
    },
    create: {
      id: 'clseed_laptop_thinkpad',
      nama: "ThinkPad X1",
      kategoriId: laptopCategory.id,
      seri: {
        create: [
          {
            serialNumber: "LP001",
            status: Status.AVAILABLE,
            jumlah: 3,
            threshold: 1,
          },
          {
            serialNumber: "LP002",
            status: Status.AVAILABLE,
            jumlah: 2,
            threshold: 1,
          },
        ],
      },
    },
    include: { seri: true },
  })

  const printer = await prisma.barang.upsert({
    where: { id: 'clseed_printer_laserjet' },
    update: {
      nama: "HP LaserJet",
      kategoriId: printerCategory.id,
    },
    create: {
      id: 'clseed_printer_laserjet',
      nama: "HP LaserJet",
      kategoriId: printerCategory.id,
      seri: {
        create: [
          {
            serialNumber: "PR001",
            status: Status.AVAILABLE,
            jumlah: 4,
            threshold: 2,
          },
          {
            serialNumber: "PR002",
            status: Status.MAINTENANCE,
            jumlah: 1,
            threshold: 1,
          },
        ],
      },
    },
    include: { seri: true },
  })

  // Create log activities using created IDs
  const logData = [];

  // Log tambah barang
  logData.push({
    userId: admin.id,
    aksi: "TAMBAH_BARANG",
    detail: `Menambahkan barang baru: ${laptop.nama} (${laptopCategory.namaKategori})`,
    barangId: laptop.id,
  });
  logData.push({
    userId: admin.id,
    aksi: "TAMBAH_BARANG",
    detail: `Menambahkan barang baru: ${printer.nama} (${printerCategory.namaKategori})`,
    barangId: printer.id,
  });

  // Log tambah seri (dengan pemeriksaan)
  if (laptop.seri && laptop.seri.length > 0) {
    laptop.seri.forEach(s => {
      logData.push({
        userId: admin.id,
        aksi: "TAMBAH_SERI",
        detail: `Menambahkan seri ${s.serialNumber} untuk ${laptop.nama}`,
        barangId: laptop.id,
        seriId: s.id,
      });
    });
  }
  if (printer.seri && printer.seri.length > 0) {
    printer.seri.forEach(s => {
      logData.push({
        userId: admin.id,
        aksi: "TAMBAH_SERI",
        detail: `Menambahkan seri ${s.serialNumber} untuk ${printer.nama}`,
        barangId: printer.id,
        seriId: s.id,
      });
    });
  }

  await prisma.logAktivitas.createMany({
    data: logData,
    skipDuplicates: true,
  });

  console.log("Seed data created successfully")
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 