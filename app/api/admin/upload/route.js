// app/api/admin/upload/route.js - File Upload API
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from '@/lib/auth';

export async function POST(request) {
  try {
    // Authentication check
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    console.log(`🖼️ File upload requested by: ${session.user.name}`);

    const data = await request.formData();
    const file = data.get('image');
    const type = data.get('type') || 'general'; // article, team, general

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'Dosya bulunamadı' 
      }, { status: 400 });
    }

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: 'Dosya boyutu çok büyük (max 5MB)' 
      }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Geçersiz dosya türü. Sadece JPG, PNG, GIF, WebP desteklenir.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${extension}`;

    // Create directory path based on type
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    const filePath = join(uploadDir, filename);

    try {
      // Create directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${type}/${filename}`;
      
      console.log(`✅ File uploaded successfully: ${publicUrl}`);
      console.log(`📁 File size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`👤 Uploaded by: ${session.user.name} (${session.user.role})`);

      return NextResponse.json({
        success: true,
        message: 'Dosya başarıyla yüklendi',
        url: publicUrl,
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: session.user.name,
        uploadedAt: new Date().toISOString()
      });

    } catch (fsError) {
      console.error('❌ File system error:', fsError);
      return NextResponse.json({ 
        success: false, 
        message: 'Dosya kaydetme hatası' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sunucu hatası' 
    }, { status: 500 });
  }
}

// GET - Uploaded files listesi (opsiyonel)
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Bu endpoint daha sonra media library için kullanılabilir
    return NextResponse.json({
      success: true,
      message: 'Media library endpoint - geliştirilecek'
    });

  } catch (error) {
    console.error('❌ GET Upload API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sunucu hatası' 
    }, { status: 500 });
  }
}

// DELETE - Dosya silme (opsiyonel)
export async function DELETE(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Bu endpoint daha sonra dosya silme için kullanılabilir
    return NextResponse.json({
      success: true,
      message: 'Delete endpoint - geliştirilecek'
    });

  } catch (error) {
    console.error('❌ DELETE Upload API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sunucu hatası' 
    }, { status: 500 });
  }
}