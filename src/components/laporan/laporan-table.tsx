"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { LogAktivitasWithRelations } from "@/types";

interface LaporanTableProps {
  data: LogAktivitasWithRelations[];
}

export const LaporanTable = ({ data }: LaporanTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.timestamp)}</TableCell>
              <TableCell>{item.user.name}</TableCell>
              <TableCell>{item.aksi}</TableCell>
              <TableCell>{item.detail}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 