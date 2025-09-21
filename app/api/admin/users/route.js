// app/api/admin/users/route.js - Dinamik Yetki Sistemi ile Güncellenmiş
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';
import { hasPermission, assignDefaultPermissions } from '@/lib/dynamicPermissions';

// Tüm kullanıcıları getir
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ❌ Eski: static permission check
    // if (!hasPermission(session.user, MODULES.USERS, ACTIONS.READ)) {
    
    // ✅ Yeni: dinamik permission check
    if (!(await hasPermission(session.user, 'users', 'read'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const active = searchParams.get('active');
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (role) {
      query.role = role;
    }
    
    // Active filter
    if (active !== null && active !== undefined && active !== '') {
      query.isActive = active === 'true';
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
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'users', 'create'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { name, email, password, role, customPermissions, isActive = true } = await request.json();
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }
    
    // Kullanıcı nesnesi oluştur
    const userData = {
      name,
      email,
      password,
      role,
      isActive,
      createdBy: session.user.id
    };
    
    // ✅ Dinamik yetki ataması
    let finalPermissions = [];
    
    if (customPermissions && customPermissions.length > 0) {
      // Custom permissions verilmişse onu kullan
      finalPermissions = customPermissions;
      console.log(`👤 ${name} için custom permissions kullanılıyor: ${customPermissions.length} modül`);
    } else {
      // Otomatik yetki ataması (dinamik sistem)
      finalPermissions = await assignDefaultPermissions({ role });
      console.log(`🤖 ${name} (${role}) için otomatik permissions: ${finalPermissions.length} modül`);
    }
    
    userData.permissions = finalPermissions;
    
    // Kullanıcıyı oluştur
    const user = await User.create(userData);
    
    // Password'u çıkar
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    console.log(`✅ Yeni kullanıcı oluşturuldu: ${user.name} (${user.role})`);
    console.log(`🔐 Toplam ${finalPermissions.length} modül yetkisi atandı`);
    
    // Atanan yetkileri detaylı logla
    finalPermissions.forEach(perm => {
      console.log(`   • ${perm.module}: [${perm.actions.join(', ')}]`);
    });
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error('User create error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}