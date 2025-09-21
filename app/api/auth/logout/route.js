// app/api/auth/logout/route.js - Güvenlik Güçlendirilmiş
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log('🚪 Logout request received');
    
    // Response oluştur
    const response = NextResponse.json({ 
      message: "Çıkış başarılı",
      timestamp: new Date().toISOString()
    });
    
    // Protokol kontrolü
    const isHttps = new URL(request.url).protocol === "https:";
    
    // Ana cookie'yi sil
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      domain: undefined, // Current domain kullan
      maxAge: 0,
      expires: new Date(0) // Past date
    });
    
    // Backup cookie silme (farklı path'ler için)
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/admin",
      domain: undefined,
      maxAge: 0,
      expires: new Date(0)
    });
    
    // Cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('✅ Logout successful, cookies cleared');
    
    return response;
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Hata olsa bile cookie'yi silmeye çalış
    const response = NextResponse.json({ 
      message: "Çıkış işlemi tamamlandı",
      error: true 
    }, { status: 500 });
    
    const isHttps = new URL(request.url).protocol === "https:";
    
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0)
    });
    
    return response;
  }
}

// GET method'u da ekle (bazı durumlarda kullanılabilir)
export async function GET(request) {
  return POST(request);
}