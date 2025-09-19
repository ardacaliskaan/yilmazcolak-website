// lib/auth.js - Complete Authentication Library
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

if (JWT_SECRET === 'fallback-secret-key') {
  console.warn('⚠️  UYARI: JWT_SECRET ayarlanmamış! Production için güvenlik riski.');
}

// Token imzalama
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'yilmazcolak-admin',
    audience: 'yilmazcolak-users'
  });
};

// Token doğrulama
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'yilmazcolak-admin',
      audience: 'yilmazcolak-users'
    });
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

// Server-side session get (Admin API'ler için)
export const getServerSession = async (request) => {
  try {
    // Request object'i yoksa cookies'e direkt erişemeyiz
    if (!request) {
      return null;
    }

    // Cookie'den token al
    let token;
    
    // NextRequest object'inde cookies.get() method'u var
    if (request.cookies && typeof request.cookies.get === 'function') {
      token = request.cookies.get('admin-token')?.value;
    } 
    // Headers'dan Cookie parse et
    else if (request.headers) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies['admin-token'];
      }
    }

    if (!token) {
      return null;
    }

    // Token'ı doğrula
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Session object'i döndür
    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        permissions: decoded.permissions
      }
    };

  } catch (error) {
    console.error('Get server session error:', error);
    return null;
  }
};

// Cookie parsing helper function
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });
  }
  return cookies;
};

// Admin API'ler için authentication wrapper
export const withAuth = (handler, requiredPermissions = null) => {
  return async (request, context) => {
    try {
      const session = await getServerSession(request);
      
      if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      // Permission check eğer gerekirse
      if (requiredPermissions) {
        const { module, action } = requiredPermissions;
        const hasPermission = session.user.permissions?.some(
          perm => perm.module === module && perm.actions.includes(action)
        );
        
        if (!hasPermission && session.user.role !== 'super-admin') {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
      }

      // Handler'ı session ile birlikte çalıştır
      return await handler(request, context, session);

    } catch (error) {
      console.error('Auth wrapper error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
  };
};