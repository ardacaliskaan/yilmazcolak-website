// app/api/admin/upload/route.js - Enhanced File Upload API
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from '@/lib/auth';

export async function POST(request) {
  try {
    // Auth kontrolü
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log(`📤 File upload request from: ${session.user.name}`);

    const formData = await request.formData();
    const file = formData.get('image');
    const type = formData.get('type') || 'general';

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'Dosya bulunamadı' 
      }, { status: 400 });
    }

    // File validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Desteklenmeyen dosya formatı. Sadece JPG, PNG, GIF, WebP destekleniyor.' 
      }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: 'Dosya boyutu çok büyük. Maksimum 5MB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const fileName = `${nameWithoutExt}-${timestamp}${extension}`;

    // Create directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    const filePath = path.join(uploadDir, fileName);

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Directory creation error:', error);
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Generate URL
    const fileUrl = `/uploads/${type}/${fileName}`;

    console.log(`✅ File uploaded successfully: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      url: fileUrl,
      originalName: file.name,
      size: file.size,
      type: file.type,
      fileName: fileName,
      category: type,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Dosya yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Update file metadata (alt text, etc.)
export async function PUT(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { fileId, alt, title, description } = await request.json();
    
    // TODO: Update file metadata in database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Dosya metadatası güncellendi',
      fileId,
      metadata: { alt, title, description }
    });

  } catch (error) {
    console.error('❌ Metadata update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Metadata güncellenirken hata oluştu'
    }, { status: 500 });
  }
}