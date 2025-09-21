// app/api/admin/users/[id]/route.js - Tamamen Yeni
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';
import { hasPermission, assignDefaultPermissions } from '@/lib/dynamicPermissions';

// Tek kullanıcıyı getir
export async function GET(request, { params }) {
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
    
    const user = await User.findById(params.id)
      .populate('createdBy', 'name')
      .select('-password');
      
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    console.log(`📄 Kullanıcı getiriliyor: ${user.name} (${user.email})`);
    
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Kullanıcıyı güncelle
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'users', 'update'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    console.log('📝 User update request:', { 
      userId: params.id, 
      fields: Object.keys(data),
      permissionsCount: data.permissions?.length 
    });
    
    // Güncellenecek kullanıcıyı getir
    const userToUpdate = await User.findById(params.id);
    if (!userToUpdate) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Super admin koruması
    if (userToUpdate.role === 'super-admin' && session.user.id !== params.id) {
      return NextResponse.json(
        { message: 'Super admin kullanıcısını sadece kendisi düzenleyebilir' },
        { status: 403 }
      );
    }
    
    // Güncelleme verisi hazırla
    const updateData = {};
    
    // Name güncelleme
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return NextResponse.json(
          { message: 'İsim boş olamaz' },
          { status: 400 }
        );
      }
      updateData.name = data.name.trim();
    }
    
    // Email güncelleme
    if (data.email !== undefined) {
      const emailToCheck = data.email.toLowerCase().trim();
      if (!emailToCheck) {
        return NextResponse.json(
          { message: 'Email boş olamaz' },
          { status: 400 }
        );
      }
      
      // Email format kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToCheck)) {
        return NextResponse.json(
          { message: 'Geçerli bir email adresi giriniz' },
          { status: 400 }
        );
      }
      
      // Email uniqueness kontrolü (kendisi hariç)
      const existingUser = await User.findOne({ 
        email: emailToCheck, 
        _id: { $ne: params.id } 
      });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }
      
      updateData.email = emailToCheck;
    }
    
    // Password güncelleme
    if (data.password !== undefined && data.password.trim()) {
      if (data.password.length < 6) {
        return NextResponse.json(
          { message: 'Şifre en az 6 karakter olmalıdır' },
          { status: 400 }
        );
      }
      updateData.password = data.password.trim();
      console.log(`🔐 ${userToUpdate.name} şifresi güncelleniyor`);
    }
    
    // Role güncelleme
    if (data.role !== undefined && data.role !== userToUpdate.role) {
      // Sadece super-admin rol değiştirebilir
      if (session.user.role !== 'super-admin') {
        return NextResponse.json(
          { message: 'Rol değiştirme yetkisi yok' },
          { status: 403 }
        );
      }
      
      // Super admin rolünü değiştirme koruması
      if (userToUpdate.role === 'super-admin') {
        return NextResponse.json(
          { message: 'Super admin rolü değiştirilemez' },
          { status: 403 }
        );
      }
      
      updateData.role = data.role;
      console.log(`🔄 ${userToUpdate.name} rolü ${userToUpdate.role} → ${data.role} değiştiriliyor`);
      
      // Rol değiştiğinde permissions güncelle (eğer custom verilmemişse)
      if (!data.permissions) {
        const newPermissions = await assignDefaultPermissions({ role: data.role });
        updateData.permissions = newPermissions;
        console.log(`🤖 Yeni rol için otomatik permissions atandı: ${newPermissions.length} modül`);
        
        // Atanan yetkileri logla
        newPermissions.forEach(perm => {
          console.log(`   • ${perm.module}: [${perm.actions.join(', ')}]`);
        });
      }
    }
    
    // Permissions güncelleme
    if (data.permissions !== undefined) {
      updateData.permissions = data.permissions;
      console.log(`👤 ${userToUpdate.name} için custom permissions güncellendi: ${data.permissions.length} modül`);
      
      // Güncellenecek yetkileri logla
      data.permissions.forEach(perm => {
        console.log(`   • ${perm.module}: [${perm.actions.join(', ')}]`);
      });
    }
    
    // Active status güncelleme
    if (data.isActive !== undefined) {
      // Super admin deaktif edilemez
      if (userToUpdate.role === 'super-admin' && !data.isActive) {
        return NextResponse.json(
          { message: 'Super admin hesabı devre dışı bırakılamaz' },
          { status: 403 }
        );
      }
      updateData.isActive = data.isActive;
      console.log(`🔄 ${userToUpdate.name} durum değişikliği: ${userToUpdate.isActive} → ${data.isActive}`);
    }
    
    // Güncelleme yap
    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query' // mongoose validatörleri için
      }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    console.log(`✅ Kullanıcı güncellendi: ${user.name} (${user.role})`);
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla güncellendi',
      user
    });
    
  } catch (error) {
    console.error('User update error:', error);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
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
        { message: 'Validation error', errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Kullanıcı güncellenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}

// Kullanıcıyı sil
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'users', 'delete'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const userToDelete = await User.findById(params.id);
    
    if (!userToDelete) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Super admin silme koruması
    if (userToDelete.role === 'super-admin') {
      return NextResponse.json(
        { message: 'Super admin kullanıcısı silinemez' },
        { status: 403 }
      );
    }

    // Kendini silme koruması
    if (session.user.id === params.id) {
      return NextResponse.json(
        { message: 'Kendi hesabınızı silemezsiniz' },
        { status: 403 }
      );
    }
    
    // Kullanıcıyı sil
    await User.findByIdAndDelete(params.id);
    
    console.log(`🗑️  Kullanıcı silindi: ${userToDelete.name} (${userToDelete.email})`);
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ message: 'Kullanıcı silinirken bir hata oluştu' }, { status: 500 });
  }
}