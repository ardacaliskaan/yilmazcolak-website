// app/api/admin/users/route.js - Tamamen Yeni
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
    
    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'users', 'read'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
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
    
    console.log(`📄 ${users.length} kullanıcı getiriliyor (total: ${total})`);
    
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
    
    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'users', 'create'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { name, email, password, role, permissions, isActive = true } = body;
    
    console.log('📝 User create request:', { 
      name, 
      email, 
      role, 
      isActive, 
      permissionsCount: permissions?.length,
      sessionUser: session.user.name 
    });
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'İsim gereklidir' },
        { status: 400 }
      );
    }
    
    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: 'Email gereklidir' },
        { status: 400 }
      );
    }
    
    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }
    
    if (!role) {
      return NextResponse.json(
        { message: 'Rol gereklidir' },
        { status: 400 }
      );
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }
    
    // Email uniqueness kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }
    
    // Kullanıcı nesnesi oluştur
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      role,
      isActive,
      createdBy: session.user.id
    };
    
    // Dinamik yetki ataması
    let finalPermissions = [];
    
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      // Frontend'ten gelen permissions kullan
      finalPermissions = permissions;
      console.log(`👤 ${name} için custom permissions kullanılıyor: ${permissions.length} modül`);
      
      // Custom permissions'ları logla
      permissions.forEach(perm => {
        console.log(`   📋 ${perm.module}: [${perm.actions.join(', ')}]`);
      });
    } else {
      // Otomatik yetki ataması (rol bazlı)
      try {
        finalPermissions = await assignDefaultPermissions({ role });
        console.log(`🤖 ${name} (${role}) için otomatik permissions: ${finalPermissions.length} modül`);
        
        // Otomatik atanan yetkileri logla
        finalPermissions.forEach(perm => {
          console.log(`   🔄 ${perm.module}: [${perm.actions.join(', ')}]`);
        });
      } catch (permError) {
        console.error('Permission assignment error:', permError);
        // Fallback - boş permissions ile devam et
        finalPermissions = [];
      }
    }
    
    userData.permissions = finalPermissions;
    
    // Kullanıcıyı oluştur
    const user = await User.create(userData);
    
    // Password'u çıkar
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    console.log(`✅ Yeni kullanıcı oluşturuldu: ${user.name} (${user.role}) - ID: ${user._id}`);
    console.log(`🔐 Toplam ${finalPermissions.length} modül yetkisi atandı`);
    console.log(`👤 Oluşturan: ${session.user.name} (${session.user.role})`);
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error('User create error:', error);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { message: `Bu ${field} zaten kullanımda` },
        { status: 400 }
      );
    }
    
    // Validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return NextResponse.json(
        { message: 'Validation hatası', errors },
        { status: 400 }
      );
    }
    
    // CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }
    
    // Password hashing errors
    if (error.message && error.message.includes('password')) {
      return NextResponse.json(
        { message: 'Şifre işlenirken hata oluştu' },
        { status: 400 }
      );
    }
    
    // Generic server error
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulurken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}