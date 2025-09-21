// app/api/auth/me/route.js - Complete Working Version
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    console.log('🔍 Auth check request received');
    
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      console.log('❌ No token found in cookies');
      return createUnauthorizedResponse('Token bulunamadı');
    }

    // Token'ı doğrula
    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token');
      return createUnauthorizedResponse('Geçersiz token');
    }
    
    console.log('✅ Token decoded successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
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
      .select('-password')
      .lean();
    
    console.log('🔍 Database query result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ User not found in database');
      return createUnauthorizedResponse('Kullanıcı bulunamadı');
    }
    
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return createUnauthorizedResponse('Hesap devre dışı');
    }
    
    console.log(`✅ Auth successful for user: ${user.name} (${user.role})`);
    
    // SUCCESS RESPONSE - Bu eksikti!
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
    
    // Cache control headers
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
    
    // Generic server error
    return createServerErrorResponse('Sunucu hatası');
  }
}

// Helper functions
function createUnauthorizedResponse(message) {
  const response = NextResponse.json({ 
    message,
    error: 'Unauthorized',
    timestamp: new Date().toISOString()
  }, { status: 401 });
  
  setCacheHeaders(response);
  return response;
}

function createServerErrorResponse(message) {
  const response = NextResponse.json({ 
    message,
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  }, { status: 500 });
  
  setCacheHeaders(response);
  return response;
}

function setCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}