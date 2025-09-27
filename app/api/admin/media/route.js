// app/api/admin/media/route.js - Galeri Yönetimi API
import { NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// ✅ GET - Uploaded images listesi
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Yetki kontrolü
    if (!(await hasPermission(session.user, 'content', 'read'))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    console.log(`📁 Media gallery request from: ${session.user.name}`);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // articles, team, general, all
    const limit = parseInt(searchParams.get('limit')) || 50;
    const sortBy = searchParams.get('sortBy') || 'date'; // date, name, size
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc

    const images = [];
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // ✅ Scan upload directories
    const scanDirectories = type === 'all' 
      ? ['articles', 'team', 'general']
      : [type];

    for (const dirType of scanDirectories) {
      const typeDir = path.join(uploadsDir, dirType);
      
      try {
        const files = await readdir(typeDir);
        
        for (const file of files) {
          const filePath = path.join(typeDir, file);
          const stats = await stat(filePath);
          
          // ✅ Sadece image files
          if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
            const fileExtension = path.extname(file);
            const originalName = file.replace(/-\d+/, ''); // Remove timestamp
            
            images.push({
              id: `${dirType}-${file}`,
              url: `/uploads/${dirType}/${file}`,
              originalName: originalName,
              fileName: file,
              type: dirType,
              size: stats.size,
              uploadedAt: stats.birthtime || stats.mtime,
              mimeType: getMimeType(fileExtension)
            });
          }
        }
      } catch (error) {
        // Directory doesn't exist, skip
        console.log(`Directory ${dirType} not found, skipping`);
      }
    }

    // ✅ Sort images
    images.sort((a, b) => {
      if (sortBy === 'date') {
        const aDate = new Date(a.uploadedAt);
        const bDate = new Date(b.uploadedAt);
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.originalName.localeCompare(a.originalName)
          : a.originalName.localeCompare(b.originalName);
      } else if (sortBy === 'size') {
        return sortOrder === 'desc' ? b.size - a.size : a.size - b.size;
      }
      return 0;
    });

    // ✅ Limit results
    const limitedImages = images.slice(0, limit);

    console.log(`✅ Found ${limitedImages.length} images (${images.length} total)`);

    return NextResponse.json({
      success: true,
      images: limitedImages,
      total: images.length,
      filtered: limitedImages.length,
      stats: {
        totalSize: images.reduce((sum, img) => sum + img.size, 0),
        types: scanDirectories,
        lastUpload: images.length > 0 ? images[0].uploadedAt : null
      }
    });

  } catch (error) {
    console.error('❌ Media gallery error:', error);
    return NextResponse.json({
      success: false,
      message: 'Medya galerisi yüklenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// ✅ DELETE - Bulk image deletion
export async function DELETE(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Yetki kontrolü
    if (!(await hasPermission(session.user, 'content', 'delete'))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { imageIds } = await request.json();
    
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Silinecek görsel seçilmedi' 
      }, { status: 400 });
    }

    console.log(`🗑️ Bulk delete request from ${session.user.name}: ${imageIds.length} images`);

    const results = [];
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    for (const imageId of imageIds) {
      try {
        // Parse image ID: "type-filename"
        const [type, ...filenameParts] = imageId.split('-');
        const filename = filenameParts.join('-');
        
        const filePath = path.join(uploadsDir, type, filename);
        
        // ✅ Security check - ensure file is within uploads directory
        const resolvedPath = path.resolve(filePath);
        const uploadsPath = path.resolve(uploadsDir);
        
        if (!resolvedPath.startsWith(uploadsPath)) {
          throw new Error('Invalid file path');
        }

        await unlink(filePath);
        
        results.push({
          id: imageId,
          success: true
        });
        
        console.log(`✅ Deleted: ${filename}`);
        
      } catch (error) {
        console.error(`❌ Failed to delete ${imageId}:`, error.message);
        
        results.push({
          id: imageId,
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failed === 0,
      message: failed === 0 
        ? `${successful} görsel başarıyla silindi`
        : `${successful} görsel silindi, ${failed} görsel silinemedi`,
      results,
      stats: { successful, failed, total: imageIds.length }
    });

  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json({
      success: false,
      message: 'Toplu silme işlemi başarısız',
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