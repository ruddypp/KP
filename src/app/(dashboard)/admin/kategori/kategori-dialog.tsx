"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

const kategoriFormSchema = z.object({
  namaKategori: z.string().min(1, { message: "Nama kategori tidak boleh kosong." })
});

type KategoriFormValues = z.infer<typeof kategoriFormSchema>;

interface Kategori {
    id: string;
    namaKategori: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

interface KategoriDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategori?: Kategori | null;
  onSuccess: () => void;
}

const createKategori = async (data: KategoriFormValues): Promise<Kategori> => {
    const response = await fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        let errorMessage = 'Gagal menambah kategori.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    return response.json();
};

const updateKategori = async ({ id, data }: { id: string, data: KategoriFormValues }): Promise<Kategori> => {
    const response = await fetch(`/api/kategori/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
     if (!response.ok) {
        let errorMessage = 'Gagal mengupdate kategori.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    return response.json();
};

export function KategoriDialog({ open, onOpenChange, kategori, onSuccess }: KategoriDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const editing = !!kategori;
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<KategoriFormValues>({
    resolver: zodResolver(kategoriFormSchema),
    defaultValues: {
      namaKategori: kategori?.namaKategori || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        namaKategori: kategori?.namaKategori || "",
      });
    }
  }, [kategori, open, form]);

  const mutation = useMutation({
    mutationFn: editing
      ? (data: KategoriFormValues) => updateKategori({ id: kategori!.id, data })
      : createKategori,
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: `Kategori berhasil ${editing ? 'diupdate' : 'ditambahkan'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['kategori'] });
      onOpenChange(false);
      if (onSuccess) {
          onSuccess();
      }
    },
    onError: (error: Error) => {
      let description = error.message || `Terjadi kesalahan saat ${editing ? 'mengupdate' : 'menambah'} kategori.`;
      
      toast({ 
        title: "Error",
        description: description,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: KategoriFormValues) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
          form.reset({ namaKategori: "" });
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          <DialogDescription>
            {editing ? "Ubah nama kategori." : "Masukkan nama untuk kategori baru."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-x-4">
                <Label htmlFor="namaKategori" className="text-right">
                Nama
                </Label>
                <div className="col-span-3">
                    <Input
                        id="namaKategori"
                        disabled={mutation.isPending}
                        {...form.register("namaKategori")}
                        className="w-full"
                    />
                    {form.formState.errors.namaKategori && (
                        <p className="text-xs text-red-600 mt-1">{form.formState.errors.namaKategori.message}</p>
                    )}
                </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
                Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 