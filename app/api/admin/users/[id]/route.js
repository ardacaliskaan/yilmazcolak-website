// app/api/admin/users/[id]/route.js - Dinamik Yetki Sistemi ile Güncellenmiş
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
    
    // ✅ Dinamik yetki kontrolü
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
    
    // ✅ Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'users', 'update'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    
    // Email kontrolü (kendisi hariç)
    if (data.email) {
      const existingUser = await User.findOne({ 
        email: data.email, 
        _id: { $ne: params.id } 
      });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }
    }

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
    
    // Rol değişikliği kontrolü
    if (data.role && data.role !== userToUpdate.role) {
      if (session.user.role !== 'super-admin') {
        return NextResponse.json(
          { message: 'Rol değiştirme yetkisi yok' },
          { status: 403 }
        );
      }
      
      // ✅ Rol değiştiğinde dinamik yetki ataması
      if (!data.customPermissions) {
        console.log(`🔄 ${userToUpdate.name} rolü ${userToUpdate.role} → ${data.role} değiştiriliyor`);
        const newPermissions = await assignDefaultPermissions({ role: data.role });
        data.permissions = newPermissions;
        console.log(`🤖 Yeni rol için otomatik permissions atandı: ${newPermissions.length} modül`);
        
        // Atanan yetkileri detaylı logla
        newPermissions.forEach(perm => {
          console.log(`   • ${perm.module}: [${perm.actions.join(', ')}]`);
        });
      }
    }

    // Custom permissions handling
    if (data.customPermissions) {
      data.permissions = data.customPermissions;
      delete data.customPermissions;
      console.log(`👤 ${userToUpdate.name} için custom permissions güncellendi`);
    }
    
    // Password güncelleme ayrı endpoint'te olacak
    delete data.password;
    
    const user = await User.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
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
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Kullanıcıyı sil
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ Dinamik yetki kontrolü
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
    
    await User.findByIdAndDelete(params.id);
    
    console.log(`🗑️  Kullanıcı silindi: ${userToDelete.name} (${userToDelete.email})`);
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}