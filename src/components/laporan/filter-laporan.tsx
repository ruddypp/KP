"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const BULAN = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export const FilterLaporan = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentBulan = searchParams.get("bulan") || new Date().getMonth() + 1;

  const handleBulanChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Select
              value={currentBulan.toString().padStart(2, "0")}
              onValueChange={handleBulanChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {BULAN.map((bulan) => (
                  <SelectItem key={bulan.value} value={bulan.value}>
                    {bulan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 