"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SeriBarang } from "@prisma/client";

interface MaintenanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  seriBarang: SeriBarang & {
    barang: {
      nama: string;
    };
  };
}

const formSchema = z.object({
  alasanPerbaikan: z
    .string()
    .min(1, "Alasan perbaikan harus diisi")
    .max(500, "Alasan perbaikan tidak boleh lebih dari 500 karakter"),
});

type FormValues = z.infer<typeof formSchema>;

export const MaintenanceDialog = ({
  isOpen,
  onClose,
  seriBarang,
}: MaintenanceDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alasanPerbaikan: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriBarangId: seriBarang.id,
          alasanPerbaikan: values.alasanPerbaikan,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      form.reset();
      router.refresh();
      onClose();
      toast.success("Permintaan perbaikan berhasil diajukan");
    } catch /*(error)*/ {
      toast.error("Gagal mengajukan permintaan perbaikan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Permintaan Perbaikan</DialogTitle>
          <DialogDescription>
            Ajukan permintaan perbaikan untuk barang {seriBarang.barang.nama} (
            {seriBarang.serialNumber})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="alasanPerbaikan"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Alasan Perbaikan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan alasan perbaikan"
                      className="resize-none"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                Ajukan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 