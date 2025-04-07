"use client"

import { useEffect, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SeriBarangTableProps {
  barangId: string
  onEdit: (seriBarang: { id: string; status: string }) => void
  onDelete: (seriBarang: { id: string; status: string }) => void
}

interface SeriBarang {
  id: string
  status: string
  createdAt: string
  requestPenggunaan: {
    user: {
      name: string
    }
  }[]
  requestMaintenance: {
    user: {
      name: string
    }
  }[]
}

export function SeriBarangTable({
  barangId,
  onEdit,
  onDelete,
}: SeriBarangTableProps) {
  const [data, setData] = useState<SeriBarang[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = selectedStatus
          ? `/api/barang/seri?barangId=${barangId}&status=${selectedStatus}`
          : `/api/barang/seri?barangId=${barangId}`
        const res = await fetch(url)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [barangId, selectedStatus])

  const columns: ColumnDef<SeriBarang>[] = [
    {
      accessorKey: "id",
      header: "ID Unit",
      cell: ({ row }) => {
        return <code className="rounded bg-muted px-2 py-1">{row.original.id}</code>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const variant =
          status === "TERSEDIA"
            ? "default"
            : status === "DIGUNAKAN"
            ? "secondary"
            : status === "MAINTENANCE"
            ? "outline"
            : "destructive"

        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "user",
      header: "Pengguna",
      cell: ({ row }) => {
        const penggunaan = row.original.requestPenggunaan[0]
        const maintenance = row.original.requestMaintenance[0]

        if (penggunaan) {
          return <span>{penggunaan.user.name}</span>
        }

        if (maintenance) {
          return <span>{maintenance.user.name}</span>
        }

        return null
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const seriBarang = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  onEdit({
                    id: seriBarang.id,
                    status: seriBarang.status,
                  })
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onDelete({
                    id: seriBarang.id,
                    status: seriBarang.status,
                  })
                }
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Cari ID unit..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua status</SelectItem>
            <SelectItem value="TERSEDIA">Tersedia</SelectItem>
            <SelectItem value="DIGUNAKAN">Digunakan</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="RUSAK">Rusak</SelectItem>
          </SelectContent>
        </Select>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )
} 