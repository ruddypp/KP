"use client"

import React, { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, ChevronDown, ChevronRight, Pencil, Trash2, PlusCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { SeriBarangSkeleton } from "@/components/seri-barang/seri-barang-skeleton"

interface Kategori { id: string; namaKategori: string; }
interface SeriBarang { id: string; serialNumber: string; status: string; jumlah: number; }
interface Barang {
  id: string;
  nama: string;
  kategoriId: string;
  kategori: Kategori;
  _count: { seri: number; };
}

interface BarangTableProps {
  data: Barang[];
  isLoading: boolean;
  onEdit: (barang: Barang) => void;
  onDelete: (barang: Barang) => void;
}

const ExpandedSeriBarang = ({ barangId }: { barangId: string }) => {
    const { data: seriData, isLoading, isError } = useQuery<SeriBarang[]>({
        queryKey: ['seriBarang', barangId],
        queryFn: async () => {
            const response = await fetch(`/api/barang/${barangId}/seri`);
            if (!response.ok) throw new Error('Gagal fetch seri barang');
            return response.json();
        },
        enabled: !!barangId,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Memuat unit...</div>;
    if (isError) return <div className="p-4 text-sm text-red-600">Gagal memuat unit.</div>;
    if (!seriData || seriData.length === 0) return <div className="p-4 text-sm text-muted-foreground">Belum ada unit terdaftar.</div>;

    return (
        <div className="p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Daftar Unit (Seri Barang):</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
                {seriData.map(seri => (
                    <li key={seri.id}>
                        SN: {seri.serialNumber} - Status: {seri.status} - Jumlah: {seri.jumlah}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export function BarangTable({ data, isLoading, onEdit, onDelete }: BarangTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [expanded, setExpanded] = useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Barang>[] = [
    {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          const canExpand = (row.original._count?.seri ?? 0) > 0;
          return canExpand ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={row.getToggleExpandedHandler()}
              style={{ cursor: 'pointer' }}
            >
              {row.getIsExpanded() ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </Button>
          ) : null;
        },
      },
    {
      accessorKey: "nama",
      header: "Nama Barang",
    },
    {
      accessorKey: "kategori.namaKategori",
      header: "Kategori",
    },
    {
      accessorKey: "_count.seri",
      header: () => <div className="text-center">Jumlah Unit</div>,
      cell: ({ row }) => <div className="text-center">{row.original._count?.seri ?? 0}</div>
    },
    {
      id: "actions",
      cell: ({ row }) => { 
        const barang = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi Barang</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(barang)}>
                 <Pencil className="mr-2 h-4 w-4"/> Edit Barang
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(barang)} className="text-red-600 focus:text-red-700 focus:bg-red-100">
                 <Trash2 className="mr-2 h-4 w-4"/> Hapus Barang
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, columnFilters, expanded, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowCanExpand: () => true,
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari barang..."
          value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nama")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
          disabled={isLoading}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow> 
                <TableCell colSpan={columns.length} className="h-24 text-center">
                   <SeriBarangSkeleton /> 
                </TableCell> 
             </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}> 
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender( cell.column.columnDef.cell, cell.getContext() )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell /> 
                      <TableCell colSpan={columns.length -1}> 
                         <ExpandedSeriBarang barangId={row.original.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow> <TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada data barang.</TableCell> </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
