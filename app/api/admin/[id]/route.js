// app/api/admin/[id]/route.js - Dinamik Yetki Sistemi ile Güncellenmiş (Team API)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamMember from '@/models/TeamMember';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// Tek ekip üyesini getir
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ❌ Eski: static permission check
    // if (!hasPermission(session.user, MODULES.TEAM, ACTIONS.READ)) {
    
    // ✅ Yeni: dinamik permission check
    if (!(await hasPermission(session.user, 'team', 'read'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const member = await TeamMember.findById(params.id);
    if (!member) {
      return NextResponse.json({ message: 'Ekip üyesi bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ member });
    
  } catch (error) {
    console.error('Team member fetch error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Ekip üyesini güncelle
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'team', 'update'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    
    // Slug kontrolü (kendisi hariç)
    if (data.slug) {
      const existingMember = await TeamMember.findOne({ 
        slug: data.slug, 
        _id: { $ne: params.id } 
      });
      if (existingMember) {
        return NextResponse.json(
          { message: 'Bu slug zaten kullanımda' },
          { status: 400 }
        );
      }
    }
    
    const member = await TeamMember.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!member) {
      return NextResponse.json({ message: 'Ekip üyesi bulunamadı' }, { status: 404 });
    }
    
    console.log(`✅ Ekip üyesi güncellendi: ${member.name}`);
    
    return NextResponse.json({
      message: 'Ekip üyesi başarıyla güncellendi',
      member
    });
    
  } catch (error) {
    console.error('Team member update error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Ekip üyesini sil
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'team', 'delete'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const member = await TeamMember.findByIdAndDelete(params.id);
    
    if (!member) {
      return NextResponse.json({ message: 'Ekip üyesi bulunamadı' }, { status: 404 });
    }
    
    console.log(`🗑️  Ekip üyesi silindi: ${member.name}`);
    
    return NextResponse.json({
      message: 'Ekip üyesi başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Team member delete error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}