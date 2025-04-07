"use client"

import * as React from "react"
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
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
// Impor Skeleton jika ada, jika tidak gunakan teks loading
// import { KategoriTableSkeleton } from "@/components/kategori/kategori-table-skeleton" 
const KategoriTableSkeleton = () => <div>Memuat data kategori...</div>; // Placeholder Skeleton


// Definisikan tipe Kategori sesuai hasil API baru
interface Kategori {
    id: string;
    namaKategori: string;
    totalUnit: number; // Field baru hasil agregasi SQL
    // Tambahkan createdAt, updatedAt jika diperlukan oleh tabel
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Definisikan props untuk komponen tabel
interface KategoriTableProps {
    data: Kategori[];
    isLoading: boolean;
    onEdit: (kategori: Kategori) => void;
    onDelete: (kategori: Kategori) => void;
}

export function KategoriTable({ data, isLoading, onEdit, onDelete }: KategoriTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Kategori>[] = [
    {
      accessorKey: "namaKategori",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Kategori
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("namaKategori")}</div>,
    },
    {
        // Kolom baru untuk Total Unit
        accessorKey: "totalUnit", // Akses field baru
        header: () => <div className="text-center">Jumlah Unit</div>, // Ubah header
        cell: ({ row }) => {
            const totalUnit = row.getValue("totalUnit") as number; // Ambil nilai totalUnit
            return <div className="text-center">{totalUnit ?? 0}</div>; // Tampilkan atau 0
        }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const kategori = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(kategori)}>
                <Pencil className="mr-2 h-4 w-4"/> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(kategori)} className="text-red-600 focus:text-red-700 focus:bg-red-100">
                 <Trash2 className="mr-2 h-4 w-4"/> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: data ?? [], // Pastikan data adalah array
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari nama kategori..."
          value={(table.getColumn("namaKategori")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("namaKategori")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
          disabled={isLoading} // Disable input saat loading
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <KategoriTableSkeleton />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data kategori.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
} 