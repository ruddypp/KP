import { Metadata } from "next"
// import { LoginForm } from "./login-form" // Hapus impor lama
import { LoginForm } from "@/components/auth/login-form" // Gunakan path alias @/

export const metadata: Metadata = {
  title: "Login - Sistem Inventaris Barang",
  description: "Halaman login untuk mengakses sistem inventaris barang",
}

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-green-600" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Sistem Inventaris Barang
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Sistem inventaris yang memudahkan pengelolaan dan pemantauan aset secara efisien.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login ke akun anda
            </h1>
            <p className="text-sm text-muted-foreground">
              Masukkan email dan password anda untuk mengakses sistem
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 