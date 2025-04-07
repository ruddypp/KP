"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Untuk menggabungkan class
import { LayoutDashboard, FileText, Wrench, Users, Box, Package } from 'lucide-react'; // Contoh ikon
import { useSession } from 'next-auth/react'; // Untuk cek role (opsional)

// Definisikan tipe untuk item navigasi
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  userOnly?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Daftar semua item navigasi
  const navItems: NavItem[] = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      adminOnly: true, // Hanya tampil untuk admin
    },
    {
      href: '/admin/kategori',
      label: 'Kategori',
      icon: Package,
      adminOnly: true,
    },
    {
      href: '/admin/barang',
      label: 'Barang',
      icon: Box, // Ikon untuk barang
      adminOnly: true,
    },
    {
      href: '/admin/maintenance',
      label: 'Maintenance',
      icon: Wrench, // Ikon untuk maintenance
      adminOnly: true,
    },
    {
      href: '/user/request',
      label: 'Request Barang',
      icon: FileText,
      userOnly: true, // Hanya tampil untuk user biasa
    },
    {
      href: '/user/maintenance',
      label: 'Maintenance (User)', // Bedakan label jika perlu
      icon: Wrench,
      userOnly: true, // Hanya tampil untuk user biasa
    },
    // Tambahkan item navigasi lain di sini
  ];

  // Filter item navigasi berdasarkan role pengguna
  const filteredNavItems = navItems.filter(item => {
    if (!session) return false; // Jangan tampilkan apapun jika belum login
    if (item.adminOnly && userRole !== 'ADMIN') return false;
    if (item.userOnly && userRole !== 'USER') return false;
    // Jika tidak ada flag adminOnly atau userOnly, tampilkan untuk semua role
    if (!item.adminOnly && !item.userOnly) return true;
    // Tampilkan jika role cocok
    return (item.adminOnly && userRole === 'ADMIN') || (item.userOnly && userRole === 'USER');
  });

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r text-card-foreground">
      <div className="flex items-center h-16 border-b px-6">
        {/* Ganti dengan Logo atau Nama Aplikasi Anda */}
        <Link href="/" className="font-bold text-lg">
          Inventaris App
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          let isActive = false;
          if (item.href === '/admin' || item.href === '/user') {
            isActive = pathname === item.href;
          } else {
            isActive = pathname.startsWith(item.href);
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center mx-2 px-4 py-2 rounded-lg text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Tambahkan bagian bawah sidebar jika perlu (misal link profile/logout) */}
    </aside>
  );
} 