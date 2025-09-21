// Düzeltilmiş Middleware - Cookie temizleme ayarları
import { NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;
  
  if (pathname === '/admin/login') {
    if (token) {
      try {
        const decoded = await verifyTokenEdge(token);
        if (decoded && decoded.exp > Math.floor(Date.now() / 1000)) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      } catch (error) {
        console.log('Token verification failed');
      }
    }
    return NextResponse.next();
  }

  if (pathname === '/admin/logout') {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const decoded = await verifyTokenEdge(token);
    if (!decoded || decoded.exp <= Math.floor(Date.now() / 1000)) {
      
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      
      // 🛠️ Login ile aynı ayarlarla cookie'yi sil
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: true,    // 👈 Login'deki gibi her zaman true
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      return response;
    }
    
    return NextResponse.next();
    
  } catch (error) {
    console.log('Token validation error:', error.message);
    
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: true,    // 👈 Login'deki gibi her zaman true
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0)
    });
    
    return response;
  }
}

export const config = { 
  matcher: ['/admin/:path*'] 
};