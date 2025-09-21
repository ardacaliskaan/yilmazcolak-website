// app/api/auth/me/route.js - Güvenlik Güçlendirilmiş
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    console.log('🔍 Auth check request received');
    
    // Cookie'den token al
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      console.log('❌ No token found in cookies');
      return createUnauthorizedResponse('Token bulunamadı');
    }

    // Token'ı doğrula
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token');
      return createUnauthorizedResponse('Geçersiz token');
    }
    
    // Token expiry kontrolü
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('❌ Token expired');
      return createUnauthorizedResponse('Token süresi dolmuş');
    }
    
    // Database bağlantısı
    await dbConnect();
    
    // Kullanıcıyı veritabanından getir
    const user = await User.findById(decoded.userId)
      .select('-password') // Password'u exclude et
      .lean(); // Performance için lean query
    
    if (!user) {
      console.log('❌ User not found in database');
      return createUnauthorizedResponse('Kullanıcı bulunamadı');
    }
    
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return createUnauthorizedResponse('Hesap devre dışı');
    }
    
    // Token'daki user data ile DB'deki data uyumlu mu kontrol et
    if (user.email !== decoded.email || user.role !== decoded.role) {
      console.log('❌ Token data mismatch with database');
      return createUnauthorizedResponse('Token verisi uyumsuz');
    }
    
    console.log(`✅ Auth successful for user: ${user.name} (${user.role})`);
    
    // Successful response
    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        issuer: decoded.iss,
        audience: decoded.aud
      },
      timestamp: new Date().toISOString()
    });
    
    // Cache control headers - Auth bilgisi cache'lenmemeli
    setCacheHeaders(response);
    
    return response;
    
  } catch (error) {
    console.error('❌ Auth check error:', error);
    
    // JWT specific errors
    if (error.name === 'JsonWebTokenError') {
      return createUnauthorizedResponse('Geçersiz token formatı');
    }
    
    if (error.name === 'TokenExpiredError') {
      return createUnauthorizedResponse('Token süresi dolmuş');
    }
    
    if (error.name === 'NotBeforeError') {
      return createUnauthorizedResponse('Token henüz geçerli değil');
    }
    
    // Database connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('Database connection error:', error);
      return createServerErrorResponse('Veritabanı bağlantı hatası');
    }
    
    // Generic server error
    return createServerErrorResponse('Sunucu hatası');
  }
}

// 401 Unauthorized response helper
function createUnauthorizedResponse(message) {
  const response = NextResponse.json({ 
    message,
    error: 'Unauthorized',
    timestamp: new Date().toISOString()
  }, { status: 401 });
  
  setCacheHeaders(response);
  return response;
}

// 500 Server Error response helper
function createServerErrorResponse(message) {
  const response = NextResponse.json({ 
    message,
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  }, { status: 500 });
  
  setCacheHeaders(response);
  return response;
}

// Cache control headers
function setCacheHeaders(response) {
  // Prevent caching of auth responses
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CORS headers (if needed)
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}