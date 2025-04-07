import { toast } from "sonner"

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleError(error: unknown, context: string) {
  console.error(`[${context}] Error:`, error)
  
  if (error instanceof AppError) {
    toast.error(error.message)
    return error
  }
  
  if (error instanceof Error) {
    toast.error(`Terjadi kesalahan: ${error.message}`)
    return new AppError(error.message, "UNKNOWN_ERROR", error)
  }
  
  toast.error("Terjadi kesalahan yang tidak diketahui")
  return new AppError("Terjadi kesalahan yang tidak diketahui", "UNKNOWN_ERROR")
}

export function createErrorHandler(context: string) {
  return (error: unknown) => handleError(error, context)
} 