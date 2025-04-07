import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import NextAuthSessionProvider from "@/components/providers/session-provider"
import QueryProvider from "@/components/providers/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistem Inventaris Barang",
  description: "Sistem manajemen inventaris barang dengan Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <NextAuthSessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </NextAuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
