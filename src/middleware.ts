import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const origin = req.nextUrl.origin;

    // Jika tidak ada token (meski withAuth harusnya handle, ini sbg fallback)
    if (!token) {
      return NextResponse.redirect(`${origin}/login`);
    }

    const isAdmin = token?.role === "ADMIN";
    const isUser = token?.role === "USER";

    // Protect /admin routes
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        // Jika user biasa mencoba akses admin, arahkan ke dashboard user
        if (isUser) {
            return NextResponse.redirect(`${origin}/user/request`); 
        }
        // Jika role lain atau tidak dikenali, arahkan ke login
        return NextResponse.redirect(`${origin}/login`); 
      }
    }

    // Protect /user routes
    if (pathname.startsWith("/user")) {
      if (!isUser) {
        // Jika admin mencoba akses user, arahkan ke dashboard admin
        if (isAdmin) {
            return NextResponse.redirect(`${origin}/admin`);
        }
        // Jika role lain atau tidak dikenali, arahkan ke login
        return NextResponse.redirect(`${origin}/login`);
      }
    }

    // Jika lolos semua pengecekan, lanjutkan
    return NextResponse.next();
  },
  {
    callbacks: {
      // Fungsi authorized ini akan dijalankan duluan oleh withAuth
      // Jika false, akan redirect ke halaman signIn
      // Kita pastikan token ada sebelum middleware utama jalan
      authorized: ({ token }) => !!token,
    },
    // Definisikan halaman login jika withAuth perlu redirect
    pages: {
      signIn: '/login',
      // error: '/auth/error', // Opsional
    }
  }
);

// Tentukan rute mana yang dilindungi middleware ini
export const config = {
  matcher: [
    "/admin/:path*", // Semua rute di bawah /admin
    "/user/:path*"   // Semua rute di bawah /user
    // "/dashboard/:path*" // Hapus ini
  ],
}; 