"use client"; // Formulir ini berinteraksi dengan pengguna, jadi perlu "use client"

import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Impor cn jika belum ada

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons"; // Asumsi ada komponen Icons untuk spinner

// 1. Definisikan skema validasi dengan Zod
const loginFormSchema = z.object({
  email: z.string().email({ message: "Masukkan alamat email yang valid." }),
  password: z
    .string()
    .min(6, { message: "Password minimal harus 6 karakter." }), // Contoh validasi
});

// 2. Infer tipe data dari skema Zod
type LoginFormValues = z.infer<typeof loginFormSchema>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {} // Opsional: Jika butuh props tambahan

export function LoginForm({ className, ...props }: UserAuthFormProps) { // Gunakan props jika ada
  const router = useRouter();
  const { toast } = useToast();

  // 3. Setup react-hook-form
  const {
    register, // Fungsi untuk mendaftarkan input
    handleSubmit, // Fungsi untuk menangani submit form
    formState: { errors, isSubmitting }, // State form (error, loading)
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema), // Gunakan resolver Zod
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 4. Logika onSubmit yang baru
  async function onSubmit(data: LoginFormValues) {
    try {
      const signInResponse = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Jangan redirect otomatis, kita handle manual
      });

      if (!signInResponse || signInResponse.error) {
        // Jika signIn gagal (error atau response null)
        toast({
          title: "Login Gagal",
          description:
            signInResponse?.error === "CredentialsSignin"
              ? "Email atau password salah."
              : "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
        console.error("Sign In Error:", signInResponse?.error); // Log error detail
      } else if (signInResponse.ok) {
        // Jika signIn berhasil
        toast({
          title: "Login Berhasil",
          description: "Mengambil data sesi dan mengarahkan...",
        });
        // Tunggu sebentar agar toast terlihat & sesi terupdate
        setTimeout(async () => {
          const session = await getSession(); // Ambil sesi terbaru
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin');
          } else {
            // Asumsikan role lain (USER) diarahkan ke /user
            router.push('/user');
          }
        }, 1000); // Delay 1 detik
      }
    } catch (error) {
      // Tangani error tak terduga
      console.error("Unexpected Sign In Error:", error);
      toast({
        title: "Error Tidak Terduga",
        description: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    }
    // IsSubmitting akan otomatis di-handle oleh react-hook-form setelah submit selesai
  }

  return (
    <div
      className={cn("grid gap-6", className)} // Gunakan cn untuk menggabungkan class
      {...props}
    >
      {/* 5. Gunakan handleSubmit dari react-hook-form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="admin@paramata.co.id"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              // 6. Daftarkan input ke react-hook-form
              {...register("email")}
              disabled={isSubmitting} // Disable saat loading
            />
            {/* 7. Tampilkan pesan error validasi */}
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              // 6. Daftarkan input ke react-hook-form
              {...register("password")}
              disabled={isSubmitting} // Disable saat loading
            />
            {/* 7. Tampilkan pesan error validasi */}
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={isSubmitting}>
            {/* 8. Tampilkan spinner saat loading */}
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Login
          </Button>
        </div>
      </form>
    </div>
  );
} 