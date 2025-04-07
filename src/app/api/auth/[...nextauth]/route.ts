import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Impor konfigurasi Anda

// Buat handler NextAuth menggunakan konfigurasi Anda
const handler = NextAuth(authOptions);

// Ekspor handler untuk metode GET dan POST
export { handler as GET, handler as POST }; 