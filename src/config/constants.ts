export const STOCK_THRESHOLD = parseInt(process.env.STOCK_THRESHOLD || "5")

export const PUSHER_EVENTS = {
  NEW_REQUEST: "new-request",
  MAINTENANCE_REQUEST: "maintenance-request",
  STATUS_CHANGE: "status-change",
  LOW_STOCK: "low-stock",
  REQUEST_UPDATE: "request-update"
} as const

export const STATUS_COLORS = {
  AVAILABLE: "bg-green-500",
  USED: "bg-blue-500",
  MAINTENANCE: "bg-yellow-500"
} as const

export const REQUEST_STATUS_COLORS = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500"
} as const

export const TOAST_MESSAGES = {
  success: {
    create: "Berhasil membuat data baru",
    update: "Berhasil mengupdate data",
    delete: "Berhasil menghapus data"
  },
  error: {
    create: "Gagal membuat data baru",
    update: "Gagal mengupdate data",
    delete: "Gagal menghapus data",
    fetch: "Gagal mengambil data"
  }
} as const 