// app/api/auth/logout/route.js - Düzeltilmiş Versiyon
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log('🚪 Logout request received');
    
    // Response oluştur
    const response = NextResponse.json({ 
      message: "Çıkış başarılı",
      timestamp: new Date().toISOString()
    });
    
    // ⚠️ ÖNEMLİ: Login ile aynı ayarları kullan
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: true,        // 👈 Login'deki gibi her zaman true
      sameSite: "lax",
      path: "/",
      // domain eklenmez (login'de de yok)
      maxAge: 0,
      expires: new Date(0)
    });
    
    // Backup temizleme (admin path için)
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/admin",
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
    
    // Hata durumunda da aynı ayarları kullan
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0)
    });
    
    return response;
  }
}

// GET method'u da ekle
export async function GET(request) {
  return POST(request);
}