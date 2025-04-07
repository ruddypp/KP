import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { LogAktivitasSkeleton } from "./log-aktivitas-skeleton"
import { LogAktivitas as PrismaLogAktivitas } from "@prisma/client"

interface LogAktivitasTableProps {
  data: PrismaLogAktivitas[]
  isLoading: boolean
}

export function LogAktivitasTable({ data, isLoading }: LogAktivitasTableProps) {
  if (isLoading) {
    return <LogAktivitasSkeleton />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Tanggal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.user.name}</TableCell>
              <TableCell>{item.aksi}</TableCell>
              <TableCell>{item.detail}</TableCell>
              <TableCell>{formatDate(item.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 