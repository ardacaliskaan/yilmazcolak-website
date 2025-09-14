// app/api/auth/me/route.js - Kullanıcı bilgilerini getir
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    const user = await User.findById(session.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
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
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}