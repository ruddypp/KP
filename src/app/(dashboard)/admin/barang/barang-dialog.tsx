"use client"

import * as React from "react"
// import { useRouter } from "next/navigation" // Tidak perlu jika onSuccess menangani refresh/invalidate
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner" // Ganti useToast dengan sonner jika digunakan di client

const formSchema = z.object({
  nama: z.string().min(3, {
    message: "Nama barang minimal 3 karakter",
  }),
  kategoriId: z.string({
    required_error: "Pilih kategori",
  }).min(1, "Pilih kategori"), // Pastikan ada value dipilih
})

interface Kategori {
  id: string
  namaKategori: string
}

// Definisikan tipe Barang yang lebih spesifik untuk dialog ini
interface BarangForDialog {
  id: string
  nama: string
  kategoriId: string
}

interface BarangDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barang?: BarangForDialog | null // Gunakan tipe spesifik
  onSuccess: () => void // Callback setelah sukses
  kategori: Kategori[] // Kategori wajib dari props
}

export function BarangDialog({
  open,
  onOpenChange,
  barang,
  onSuccess,
  kategori = [], // Default ke array kosong jika tidak ada
}: BarangDialogProps) {
  const editing = !!barang
  // const router = useRouter() // Tidak perlu lagi
  // const { toast } = useToast() // Ganti ke sonner jika perlu
  const [isLoading, setIsLoading] = React.useState(false)
  // Hapus state dan fetch kategori internal
  // const [kategori, setKategori] = React.useState<Kategori[]>([])
  // React.useEffect(() => { ... fetchKategori ... }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values di-set di useEffect di bawah
  })

  // Reset form saat 'barang' atau 'open' berubah
  React.useEffect(() => {
    if (open) {
      form.reset({
        nama: barang?.nama || "",
        kategoriId: barang?.kategoriId || "",
      })
    }
  }, [barang, open, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch(
        // Pastikan menggunakan ID barang yang benar untuk path [barangId]
        editing ? `/api/barang/${barang?.id}` : "/api/barang", // <-- Tetap pakai barang.id jika itu nama propnya
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      )

      if (!response.ok) {
        // Handle error response
        let errorMessage = `Gagal menyimpan barang (Status: ${response.status})`;
        try {
          // Coba parse JSON, tapi siapkan fallback
          const errorData = await response.json();
          // Jika berhasil parse dan ada message, gunakan itu
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } 
        } catch (jsonError) {
          // Jika gagal parse JSON (misal body kosong atau bukan JSON)
          console.error("Gagal parse JSON error response:", jsonError);
          // Bisa coba baca sebagai teks jika perlu info tambahan (opsional)
          // try {
          //   const errorText = await response.text();
          //   if (errorText) errorMessage += `: ${errorText}`;
          // } catch (textError) {}
        }
        throw new Error(errorMessage); // Lemparkan error dengan pesan yang sudah dirakit
      }

      // Panggil onSuccess dari props jika berhasil (response.ok)
      onSuccess()
      onOpenChange(false) // Tutup dialog

      // Hapus toast dan refresh internal
      // toast({ title: `Barang berhasil ${editing ? "diubah" : "ditambahkan"}` })
      // router.refresh()

    } catch (error) {
      console.error("Submit error:", error) // Log error untuk debugging
      toast.error(
        "Terjadi kesalahan",
        { description: error instanceof Error ? error.message : "Gagal menyimpan barang"}
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Barang" : "Tambah Barang"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Edit informasi barang yang sudah ada."
              : "Tambah barang baru ke sistem."}
          </DialogDescription>
        </DialogHeader>
        {/* Periksa apakah kategori sudah dimuat */}
        {!kategori || kategori.length === 0 ? (
             <div>Memuat data kategori...</div> // Atau tampilkan pesan/skeleton
        ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Barang</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama barang" {...field} disabled={isLoading}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kategoriId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value} // Gunakan value, bukan defaultValue di sini
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Gunakan kategori dari props */}
                          {kategori.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.namaKategori}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    type="button"
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        // ... atribut svg lainnya ...
                         width="24"
                         height="24"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="2"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    )}
                    {editing ? "Simpan Perubahan" : "Tambah Barang"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 