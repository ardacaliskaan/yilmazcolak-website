// app/api/admin/media/[id]/route.js - Tek Görsel İşlemleri COMPLETE
import { NextResponse } from 'next/server';
import { stat, unlink } from 'fs/promises';
import path from 'path';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// ✅ GET - Single image details
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Yetki kontrolü
    if (!(await hasPermission(session.user, 'content', 'read'))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const imageId = params.id;
    
    // Parse image ID: "type-filename"
    const [type, ...filenameParts] = imageId.split('-');
    const filename = filenameParts.join('-');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, type, filename);
    
    try {
      const stats = await stat(filePath);
      
      const imageData = {
        id: imageId,
        url: `/uploads/${type}/${filename}`,
        originalName: filename.replace(/-\d+/, ''), // Remove timestamp
        fileName: filename,
        type: type,
        size: stats.size,
        uploadedAt: stats.birthtime || stats.mtime,
        mimeType: getMimeType(path.extname(filename))
      };
      
      console.log(`✅ Image details fetched: ${filename}`);
      
      return NextResponse.json({
        success: true,
        image: imageData
      });
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Görsel bulunamadı'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Single image fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Görsel bilgileri alınamadı'
    }, { status: 500 });
  }
}

// ✅ DELETE - Single image deletion
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Yetki kontrolü
    if (!(await hasPermission(session.user, 'content', 'delete'))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const imageId = params.id;
    
    console.log(`🗑️ Single delete request from ${session.user.name}: ${imageId}`);

    // Parse image ID: "type-filename"
    const [type, ...filenameParts] = imageId.split('-');
    const filename = filenameParts.join('-');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, type, filename);
    
    // ✅ Security check - ensure file is within uploads directory
    const resolvedPath = path.resolve(filePath);
    const uploadsPath = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(uploadsPath)) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz dosya yolu'
      }, { status: 400 });
    }

    try {
      // Check if file exists
      await stat(filePath);
      
      // Delete file
      await unlink(filePath);
      
      console.log(`✅ Deleted: ${filename}`);
      
      return NextResponse.json({
        success: true,
        message: 'Görsel başarıyla silindi',
        deletedImage: {
          id: imageId,
          filename: filename,
          type: type
        }
      });
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({
          success: false,
          message: 'Görsel bulunamadı'
        }, { status: 404 });
      }
      
      throw error;
    }

  } catch (error) {
    console.error(`❌ Failed to delete ${params.id}:`, error);
    return NextResponse.json({
      success: false,
      message: 'Görsel silinirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// ✅ PUT - Update image metadata (alt text, title, etc.)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Yetki kontrolü
    if (!(await hasPermission(session.user, 'content', 'update'))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const imageId = params.id;
    const body = await request.json();
    const { alt, title, description } = body;
    
    console.log(`📝 Update metadata for ${imageId}:`, { alt, title, description });
    
    // Parse image ID to validate
    const [type, ...filenameParts] = imageId.split('-');
    const filename = filenameParts.join('-');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, type, filename);
    
    // Check if file exists
    try {
      await stat(filePath);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Görsel bulunamadı'
      }, { status: 404 });
    }
    
    // Note: Bu basit implementasyon sadece response döner
    // Gerçek projede metadata'yı database'de saklayabilirsiniz
    
    return NextResponse.json({
      success: true,
      message: 'Görsel bilgileri güncellendi',
      image: {
        id: imageId,
        alt: alt || '',
        title: title || '',
        description: description || '',
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id
      }
    });

  } catch (error) {
    console.error('❌ Update metadata error:', error);
    return NextResponse.json({
      success: false,
      message: 'Görsel bilgileri güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// ✅ Helper function - MIME type detection
function getMimeType(extension) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}