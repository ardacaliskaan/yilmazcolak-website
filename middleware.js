// middleware.js - Route Protection
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Admin route'larını koru
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token');
    
    // Login sayfasına gidiyorsa, zaten giriş yapmışsa dashboard'a yönlendir
    if (pathname === '/admin/login') {
      if (token && verifyToken(token.value)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }
    
    // Diğer admin sayfaları için token kontrolü
    if (!token || !verifyToken(token.value)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};