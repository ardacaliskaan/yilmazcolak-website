// app/api/admin/team/route.js - Dinamik Yetki Sistemi ile Güncellenmiş
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamMember from '@/models/TeamMember';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// Tüm ekip üyelerini getir
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'team', 'read'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const position = searchParams.get('position');
    const active = searchParams.get('active');
    const sortField = searchParams.get('sortField') || 'sortOrder';
    const sortDirection = searchParams.get('sortDirection') || 'asc';
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Position filter
    if (position) {
      query.position = position;
    }
    
    // Active filter
    if (active !== null && active !== undefined && active !== '') {
      query.isActive = active === 'true';
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortField]: sortDirection === 'asc' ? 1 : -1 };
    
    const [members, total] = await Promise.all([
      TeamMember.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      TeamMember.countDocuments(query)
    ]);
    
    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Team members fetch error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Yeni ekip üyesi oluştur
export async function POST(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'team', 'create'))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const memberData = await request.json();
    
    // Slug kontrolü
    if (memberData.slug) {
      const existingMember = await TeamMember.findOne({ slug: memberData.slug });
      if (existingMember) {
        return NextResponse.json(
          { message: 'Bu slug zaten kullanımda' },
          { status: 400 }
        );
      }
    }
    
    // Email kontrolü (varsa)
    if (memberData.email) {
      const existingEmail = await TeamMember.findOne({ email: memberData.email });
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }
    }
    
    const member = await TeamMember.create(memberData);
    
    console.log(`✅ Yeni ekip üyesi oluşturuldu: ${member.name} (${member.position})`);
    
    return NextResponse.json({
      message: 'Ekip üyesi başarıyla oluşturuldu',
      member
    }, { status: 201 });
    
  } catch (error) {
    console.error('Team member create error:', error);
    if (error.code === 11000) {
      // Unique constraint error
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `Bu ${field} zaten kullanımda` },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}