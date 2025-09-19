// app/api/admin/team/route.js - Ekip API'si
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamMember from '@/models/TeamMember';
import { getServerSession } from '@/lib/auth';
import { hasPermission, MODULES, ACTIONS } from '@/lib/permissions';

// Tüm ekip üyelerini getir
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
if (!hasPermission(session.user, MODULES.TEAM, ACTIONS.READ)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const position = searchParams.get('position') || '';
    const isActive = searchParams.get('active');
    
    // Filtreler
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    if (position) query.position = position;
    if (isActive !== null && isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    // Sayfalama
    const skip = (page - 1) * limit;
    
    const [members, total] = await Promise.all([
      TeamMember.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
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
    console.error('Team fetch error:', error);
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
    
if (!hasPermission(session.user, MODULES.TEAM, ACTIONS.CREATE)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    
    // Slug kontrolü
    if (data.slug) {
      const existingMember = await TeamMember.findOne({ slug: data.slug });
      if (existingMember) {
        return NextResponse.json(
          { message: 'Bu slug zaten kullanımda' },
          { status: 400 }
        );
      }
    }
    
    const member = await TeamMember.create(data);
    
    return NextResponse.json({
      message: 'Ekip üyesi başarıyla oluşturuldu',
      member
    }, { status: 201 });
    
  } catch (error) {
    console.error('Team create error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}