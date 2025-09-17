import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

if (JWT_SECRET === 'fallback-secret-key') {
  console.warn('⚠️  UYARI: JWT_SECRET ayarlanmamış! Production için güvenlik riski.');
}

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'yilmazcolak-admin',
    audience: 'yilmazcolak-users'
  });
};

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