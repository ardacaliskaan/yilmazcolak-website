// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = request.cookies.get('admin-token')?.value;

  // Login sayfası: token varsa dashboard'a yolla
  if (pathname === '/admin/login') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Diğer admin sayfaları: token yoksa login'e yolla
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
