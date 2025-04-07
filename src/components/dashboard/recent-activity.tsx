import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Activity {
  id: string;
  aksi: string;
  detail: string;
  createdAt: Date;
  user: {
    name: string;
  };
  barang?: {
    nama: string;
  } | null;
  seri?: {
    serialNumber: string;
  } | null;
}

interface RecentActivityProps {
  data: Activity[];
}

export function RecentActivity({ data }: RecentActivityProps) {
  return (
    <div className="space-y-8">
      {data.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-6">
              {activity.user.name}
              <span className="text-gray-500"> - {activity.aksi}</span>
            </p>
            <p className="mt-1 truncate text-sm text-gray-500">
              {activity.detail}
              {activity.barang && (
                <span className="ml-1">
                  ({activity.barang.nama}
                  {activity.seri && ` - ${activity.seri.serialNumber}`})
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {format(new Date(activity.createdAt), "d MMMM yyyy, HH:mm", {
                locale: id,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 