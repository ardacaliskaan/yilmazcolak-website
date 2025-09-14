// app/api/auth/logout/route.js - Çıkış API'si
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Çıkış başarılı' });
  
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  });
  
  return response;
}