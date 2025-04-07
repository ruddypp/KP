import { Status, Role } from "@prisma/client"

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Kategori {
  id: string
  namaKategori: string
}

export interface Barang {
  id: string
  nama: string
  kategoriId: string
  kategori: Kategori
  seri: SeriBarang[]
  _count?: {
    seri: number
  }
}

export interface SeriBarang {
  id: string
  barangId: string
  serialNumber: string
  status: Status
  jumlah: number
  barang?: Barang
}

export interface RequestPenggunaan {
  id: string
  userId: string
  user: User
  seriId: string
  seriBarang: SeriBarang
  status: RequestStatus
  alasan?: string
  createdAt: Date
  updatedAt: Date
}

export interface RequestMaintenance {
  id: string
  userId: string
  user: User
  seriBarangId: string
  seriBarang: SeriBarang
  alasanPerbaikan: string
  status: RequestStatus
  keterangan?: string
  createdAt: Date
  updatedAt: Date
}

export interface LogAktivitas {
  id: string
  userId: string
  user: User
  aksi: string
  barangId?: string
  barang?: Barang
  seriId?: string
  seriBarang?: SeriBarang
  timestamp: Date
}

export interface DashboardStats {
  totalKategori: number
  totalBarang: number
  totalSeriBarang: number
  statusCount: {
    [key in Status]: number
  }
}

export interface ChartData {
  name: string
  value: number
}

export interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  userId: string
  type: "REQUEST" | "STATUS_CHANGE" | "LOW_STOCK"
  createdAt: Date
}

export type LogAktivitasWithRelations = LogAktivitas & {
  user: User
  barang?: Barang & {
    kategori: Kategori
  }
  seriBarang?: SeriBarang & {
    barang: Barang
  }
}

export type MaintenanceWithRelations = RequestMaintenance & {
  user: User
  seriBarang: SeriBarang & {
    barang: Barang & {
      kategori: Kategori
    }
  }
} 