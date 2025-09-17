// app/api/auth/me/route.js - Güvenlik güncellemesi
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Cookie'den token al
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Token bulunamadı' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Geçersiz token' }, { status: 401 });
    }
    
    await dbConnect();
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}
