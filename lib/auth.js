// lib/auth.js - Jose Library ile Edge Runtime Uyumlu
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-long';
const secret = new TextEncoder().encode(JWT_SECRET);

console.log('JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No');

// Token imzalama
export const signToken = async (payload) => {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('yilmazcolak-admin')
      .setAudience('yilmazcolak-users')
      .setExpirationTime('7d')
      .sign(secret);
  } catch (error) {
    console.error('Token signing error:', error);
    throw error;
  }
};

// Token doğrulama
export const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'yilmazcolak-admin',
      audience: 'yilmazcolak-users',
    });
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

// Edge Runtime uyumlu (middleware için)
export const verifyTokenEdge = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
};

// Server-side session get (Admin API'ler için)
export const getServerSession = async (request) => {
  try {
    if (!request) return null;

    let token;
    
    if (request.cookies && typeof request.cookies.get === 'function') {
      token = request.cookies.get('admin-token')?.value;
    } 
    else if (request.headers) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies['admin-token'];
      }
    }

    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded) return null;

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

// Cookie parsing helper
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