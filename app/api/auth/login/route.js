// app/api/auth/login/route.js - Giriş API'si
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    // Kullanıcıyı bul (şifre ile birlikte)
    const user = await User.findOne({ email, isActive: true }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { message: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }
    
    // Son giriş zamanını güncelle
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    // JWT token oluştur
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions
    });
    
    // Cookie ayarla
    const response = NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}