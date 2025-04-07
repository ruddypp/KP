'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

// Komponen ini hanya bertugas merender SessionProvider
// dan ditandai 'use client' agar bisa digunakan di root layout (Server Component)
export default function NextAuthSessionProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
} 