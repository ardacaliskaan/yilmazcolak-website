// app/api/auth/logout/route.js - Nuclear Logout API
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log('🚪 Nuclear Logout başladı');
    
    const response = NextResponse.json({ 
      message: "Çıkış başarılı",
      nuclear: true,
      timestamp: new Date().toISOString()
    });
    
    // 🔥 NUCLEAR OPTION: Her türlü cookie kombinasyonunu sil
    const cookieNames = ['admin-token', 'token', 'auth-token', 'session', 'jwt'];
    const paths = ['/', '/admin'];
    const secureOptions = [true, false];
    const sameSiteOptions = ['lax', 'strict', 'none'];
    
    cookieNames.forEach(name => {
      paths.forEach(path => {
        secureOptions.forEach(secure => {
          sameSiteOptions.forEach(sameSite => {
            try {
              // Domain olmadan
              response.cookies.set(name, "", {
                httpOnly: true,
                secure,
                sameSite,
                path,
                maxAge: 0,
                expires: new Date(0)
              });
              
              // Localhost domain ile
              response.cookies.set(name, "", {
                httpOnly: true,
                secure,
                sameSite,
                path,
                domain: 'localhost',
                maxAge: 0,
                expires: new Date(0)
              });
              
              // .localhost domain ile  
              response.cookies.set(name, "", {
                httpOnly: true,
                secure,
                sameSite,
                path,
                domain: '.localhost',
                maxAge: 0,
                expires: new Date(0)
              });
              
            } catch (e) {
              // Ignore errors - some combinations may fail
            }
          });
        });
      });
    });
    
    console.log('✅ Nuclear logout - all cookie combinations cleared');
    
    // Extra aggressive headers
    response.headers.set('Set-Cookie', 'admin-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
    
    return response;
    
  } catch (error) {
    console.error('❌ Nuclear logout error:', error);
    return NextResponse.json({ message: "Nuclear logout completed with errors" }, { status: 200 });
  }
}

export async function GET(request) {
  return POST(request);
}