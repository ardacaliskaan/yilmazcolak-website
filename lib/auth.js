// lib/auth.js - Authentication Helpers
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET environment variable not set!");
}

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("❌ JWT verify failed:", error.message);
    return null;
  }
};

export const getServerSession = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('admin-token');

  if (!token) return null;

  const decoded = verifyToken(token.value);
  return decoded || null;
};
