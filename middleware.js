// middleware.js - Güvenlik Güçlendirilmiş
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Admin path'i değilse middleware'i atla
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;
  
  console.log(`Middleware check: ${pathname}, token: ${token ? 'exists' : 'none'}`);

  // Login sayfası: token varsa ve geçerliyse dashboard'a yönlendir
  if (pathname === '/admin/login') {
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decoded.exp && decoded.exp > currentTime) {
          console.log('Valid token found, redirecting to dashboard');
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
          console.log('Expired token found, allowing login page');
        }
      } catch (error) {
        console.log('Invalid token found, allowing login page');
      }
    }
    return NextResponse.next();
  }

  // Logout sayfası: token kontrolü yapmadan geç
  if (pathname === '/admin/logout') {
    return NextResponse.next();
  }

  // Diğer tüm admin sayfaları: token kontrolü
  if (!token) {
    console.log('No token, redirecting to login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Token geçerliliğini kontrol et
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Token süresi dolmuş mu?
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expired, redirecting to login');
      
      // Expired token'ı temizle
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: request.url.startsWith('https:'),
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      });
      return response;
    }
    
    // Token geçerli, devam et
    console.log(`Valid token for user: ${decoded.email}`);
    return NextResponse.next();
    
  } catch (error) {
    console.log('Invalid token, redirecting to login:', error.message);
    
    // Invalid token'ı temizle
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: request.url.startsWith('https:'),
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });
    return response;
  }
}

export const config = { 
  matcher: ['/admin/:path*'] 
};