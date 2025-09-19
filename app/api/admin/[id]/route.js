// app/api/admin/team/[id]/route.js - Tek ekip üyesi işlemleri
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamMember from '@/models/TeamMember';
import { getServerSession } from '@/lib/auth';
import { hasPermission, MODULES, ACTIONS } from '@/lib/permissions';

// Tek ekip üyesini getir
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(session, MODULES.TEAM, ACTIONS.READ)) {
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
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(session, MODULES.TEAM, ACTIONS.UPDATE)) {
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
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(session, MODULES.TEAM, ACTIONS.DELETE)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const member = await TeamMember.findByIdAndDelete(params.id);
    
    if (!member) {
      return NextResponse.json({ message: 'Ekip üyesi bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Ekip üyesi başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Team member delete error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
