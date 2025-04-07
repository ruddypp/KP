import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RequestDialog } from "./request-dialog"
import { MaintenanceDialog } from "./maintenance-dialog"
import { BarangSkeleton } from "@/components/barang/barang-skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface UserBarangTableProps {
  data: any[]
  isLoading: boolean
  mutate: () => void
}

export function UserBarangTable({
  data,
  isLoading,
  mutate,
}: UserBarangTableProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [selectedBarang, setSelectedBarang] = useState<any>(null)
  const [selectedSeriBarang, setSelectedSeriBarang] = useState<any>(null)

  if (isLoading) {
    return <BarangSkeleton />
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Total Tersedia</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.kategori.nama}</TableCell>
                <TableCell>
                  {item.seri.filter((s: any) => s.status === "TERSEDIA").reduce((acc: number, curr: any) => acc + curr.jumlah, 0)}
                </TableCell>
                <TableCell>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="seri">
                      <AccordionTrigger>Lihat Seri Barang</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {item.seri.map((seri: any) => (
                            <div
                              key={seri.id}
                              className="flex items-center justify-between rounded-lg border p-4"
                            >
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {seri.serialNumber}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={
                                      seri.status === "TERSEDIA"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {seri.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Jumlah: {seri.jumlah}
                                  </span>
                                </div>
                              </div>
                              <div className="space-x-2">
                                {seri.status === "TERSEDIA" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBarang(item)
                                      setSelectedSeriBarang(seri)
                                      setIsRequestDialogOpen(true)
                                    }}
                                  >
                                    Request
                                  </Button>
                                )}
                                {seri.status !== "MAINTENANCE" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBarang(item)
                                      setSelectedSeriBarang(seri)
                                      setIsMaintenanceDialogOpen(true)
                                    }}
                                  >
                                    Maintenance
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RequestDialog
        open={isRequestDialogOpen}
        setOpen={setIsRequestDialogOpen}
        barang={selectedBarang}
        seriBarang={selectedSeriBarang}
        mutate={mutate}
      />

      <MaintenanceDialog
        open={isMaintenanceDialogOpen}
        setOpen={setIsMaintenanceDialogOpen}
        barang={selectedBarang}
        seriBarang={selectedSeriBarang}
        mutate={mutate}
      />
    </>
  )
} 