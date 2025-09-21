// app/api/admin/permissions/modules/route.js - Dinamik Modül API'si
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PermissionModule from '@/models/Permission';
import { getServerSession } from '@/lib/auth';

// Modülleri getir
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const category = searchParams.get('category');
    
    let query = {};
    if (activeOnly) query.isActive = true;
    if (category) query.category = category;
    
    const modules = await PermissionModule.find(query)
      .sort({ menuOrder: 1, name: 1 })
      .lean();
    
    console.log(`📦 ${modules.length} modül döndürülüyor (active: ${activeOnly})`);
    
    return NextResponse.json({ 
      modules,
      total: modules.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Modules fetch error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}