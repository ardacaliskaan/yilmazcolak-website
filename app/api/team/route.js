// app/api/team/route.js - Complete Public Team API (No Auth Required)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamMember from '@/models/TeamMember';

// Public ekip üyelerini getir (Yetki gerektirmez)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured'); // Anasayfa için featured olanlar
    const position = searchParams.get('position'); // Pozisyona göre filtre
    const limit = parseInt(searchParams.get('limit')) || 0;
    const search = searchParams.get('search') || '';
    
    // Query oluştur - sadece aktif üyeler
    let query = { isActive: true };
    
    if (featured === 'true') {
      query.featuredOnHomepage = true;
    }
    
    if (position) {
      query.position = position;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { specializations: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sırala ve getir
    let membersQuery = TeamMember.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-__v -createdAt -updatedAt'); // Gereksiz field'ları hariç tut
    
    if (limit > 0) {
      membersQuery = membersQuery.limit(limit);
    }
    
    const members = await membersQuery;
    
    // Response cache headers ekle (5 dakika cache)
    const response = NextResponse.json({
      success: true,
      members,
      total: members.length
    });
    
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
    
  } catch (error) {
    console.error('Public team fetch error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Server error',
      members: [],
      total: 0
    }, { status: 500 });
  }
}