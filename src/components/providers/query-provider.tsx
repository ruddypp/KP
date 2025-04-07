'use client';

import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Opsional: untuk debugging

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Pengaturan default react-query jika diperlukan
        // Misalnya: staleTime, cacheTime
        staleTime: 60 * 1000, // 1 menit
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: buat instance baru setiap saat
    return makeQueryClient();
  }
  // Browser: gunakan instance yang sudah ada atau buat baru
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  // NOTE: Ini akan membuat instance baru di setiap render server.
  // Jika Anda ingin instance persisten per request, perlu setup berbeda.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}{/* Aktifkan jika perlu devtools */}
    </QueryClientProvider>
  );
} 