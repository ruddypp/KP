import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Komponen ini akan ditampilkan secara otomatis saat
// navigasi ke /admin atau sub-rute di bawahnya sedang berlangsung.
export default function AdminLoading() {
  return (
    <div className="flex flex-col space-y-6">
      {/* Skeleton untuk Header */}
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Skeleton untuk Card Overview (3 kolom) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-1/3" /> 
            <Skeleton className="h-4 w-4" /> 
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" /> 
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" />
          </CardContent>
        </Card>
      </div>

      {/* Skeleton untuk Chart (2 kolom) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="pl-2">
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
             <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 