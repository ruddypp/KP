"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  status: z.enum(["TERSEDIA", "DIGUNAKAN", "MAINTENANCE", "RUSAK"]),
  jumlah: z.number().int().positive().nullable(),
})

interface SeriBarangDialogProps {
  open: boolean
  onClose: () => void
  seriBarang?: {
    id: string
    status: string
  } | null
  barangId: string
}

export function SeriBarangDialog({
  open,
  onClose,
  seriBarang,
  barangId,
}: SeriBarangDialogProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "TERSEDIA",
      jumlah: null,
    },
  })

  useEffect(() => {
    if (seriBarang) {
      form.reset({
        status: seriBarang.status as "TERSEDIA" | "DIGUNAKAN" | "MAINTENANCE" | "RUSAK",
        jumlah: null,
      })
    } else {
      form.reset({
        status: "TERSEDIA",
        jumlah: null,
      })
    }
  }, [seriBarang, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch("/api/barang/seri", {
        method: seriBarang ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          seriBarang
            ? { id: seriBarang.id, status: values.status }
            : { barangId, jumlah: values.jumlah }
        ),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success(
        seriBarang
          ? "Status unit barang berhasil diperbarui"
          : "Unit barang berhasil ditambahkan"
      )
      router.refresh()
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {seriBarang ? "Edit Status Unit" : "Tambah Unit"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {seriBarang ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TERSEDIA">Tersedia</SelectItem>
                        <SelectItem value="DIGUNAKAN">Digunakan</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="RUSAK">Rusak</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="jumlah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan jumlah unit"
                        {...field}
                        value={field.value === null ? "" : String(field.value)}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === "" ? null : Number(value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {seriBarang ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 