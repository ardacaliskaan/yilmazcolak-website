// app/api/admin/users/route.js - Kullanıcı Yönetimi API'si
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';
import { hasPermission, MODULES, ACTIONS, DEFAULT_PERMISSIONS } from '@/lib/permissions';

// Tüm kullanıcıları getir
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(session, MODULES.USERS, ACTIONS.READ)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('createdBy', 'name')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Yeni kullanıcı oluştur
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(session, MODULES.USERS, ACTIONS.CREATE)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { name, email, password, role, customPermissions } = await request.json();
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }
    
    // Yetkiler - custom varsa onu kullan, yoksa default
    const permissions = customPermissions || DEFAULT_PERMISSIONS[role] || [];
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      permissions,
      createdBy: session.userId
    });
    
    // Password'u çıkar
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error('User create error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}