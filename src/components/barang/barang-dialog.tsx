"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Kategori } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  nama: z.string().min(1, {
    message: "Nama barang harus diisi",
  }),
  kategoriId: z.string().min(1, {
    message: "Kategori harus dipilih",
  }),
});

interface BarangDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kategori: Kategori[];
  initialData?: {
    id: string;
    nama: string;
    kategoriId: string;
  };
  onSuccess?: () => void;
}

export const BarangDialog = ({
  isOpen,
  onClose,
  kategori,
  initialData,
  onSuccess,
}: BarangDialogProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const title = initialData ? "Edit Barang" : "Tambah Barang";
  const action = initialData ? "Simpan" : "Tambah";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: initialData?.nama || "",
      kategoriId: initialData?.kategoriId || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await fetch(`/api/barang/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        toast.success("Barang berhasil diperbarui");
      } else {
        await fetch("/api/barang", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        toast.success("Barang berhasil ditambahkan");
      }
      router.refresh();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch /*(error)*/ {
      console.error("Error saving barang:");
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Barang</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Masukkan nama barang"
                      {...field}
                    />
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
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {action}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 