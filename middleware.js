// middleware.js - Logout-aware versiyon
import { NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;
  
  // 🔥 ÇÖZÜM: Logout'tan gelen referrer'ı kontrol et
  const referer = request.headers.get('referer') || '';
  const fromLogout = referer.includes('/admin/logout');
  
  console.log(`Middleware: ${pathname}, token: ${token ? 'exists' : 'none'}, fromLogout: ${fromLogout}`);

  // Login sayfası
  if (pathname === '/admin/login') {
    // Logout'tan geliyorsa token'ı force temizle ve login'e izin ver
    if (fromLogout) {
      console.log('🔥 Coming from logout - force clearing token');
      const response = NextResponse.next();
      
      // Token'ı agressive şekilde temizle
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      return response;
    }
    
    // Normal login check
    if (token) {
      try {
        const decoded = await verifyTokenEdge(token);
        if (decoded && decoded.exp > Math.floor(Date.now() / 1000)) {
          console.log('Valid token, redirecting to dashboard');
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      } catch (error) {
        console.log('Token verification failed');
      }
    }
    return NextResponse.next();
  }

  // Logout sayfası
  if (pathname === '/admin/logout') {
    return NextResponse.next();
  }

  // Diğer admin sayfaları - token kontrolü
  if (!token) {
    console.log('No token, redirecting to login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const decoded = await verifyTokenEdge(token);
    if (!decoded || decoded.exp <= Math.floor(Date.now() / 1000)) {
      console.log('Invalid/expired token, clearing and redirecting');
      
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      
      return response;
    }
    
    console.log(`Valid access for: ${decoded.email}`);
    return NextResponse.next();
    
  } catch (error) {
    console.log('Token validation error:', error.message);
    
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: true,
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