// app/api/team/[slug]/route.js - PUBLIC Team Member by Slug API (Yetki gerektirmez)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeamMember from '@/models/TeamMember';

// Slug'a göre public ekip üyesini getir (Yetki gerektirmez)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({ 
        success: false,
        message: 'Slug parametresi gerekli',
        member: null 
      }, { status: 400 });
    }
    
    // Aktif ve slug'ı eşleşen üyeyi bul
    const member = await TeamMember.findOne({ 
      slug: slug,
      isActive: true 
    }).select('-__v -createdAt -updatedAt');
    
    if (!member) {
      return NextResponse.json({ 
        success: false,
        message: 'Ekip üyesi bulunamadı',
        member: null 
      }, { status: 404 });
    }
    
    // İlgili ekip üyelerini de getir (aynı pozisyondaki diğer 3 kişi)
    const relatedMembers = await TeamMember.find({
      position: member.position,
      isActive: true,
      _id: { $ne: member._id }
    })
    .limit(3)
    .select('name title slug image position')
    .sort({ sortOrder: 1 });
    
    const response = NextResponse.json({
      success: true,
      member,
      relatedMembers
    });
    
    // Response cache headers ekle (10 dakika cache)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return response;
    
  } catch (error) {
    console.error('Public team member fetch error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Server error',
      member: null,
      relatedMembers: []
    }, { status: 500 });
  }
}