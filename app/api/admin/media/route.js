// app/api/admin/media/route.js - Media Gallery Management API
import { NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { getServerSession } from '@/lib/auth';

// GET - Media gallery listing
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    console.log(`📁 Media gallery request: type=${type}, limit=${limit}, page=${page}, search=${search}`);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Read all media files
    const images = [];
    
    try {
      const categories = await readdir(uploadsDir);
      
      for (const category of categories) {
        const categoryPath = path.join(uploadsDir, category);
        const categoryStats = await stat(categoryPath);
        
        if (categoryStats.isDirectory()) {
          const files = await readdir(categoryPath);
          
          for (const file of files) {
            const filePath = path.join(categoryPath, file);
            const fileStats = await stat(filePath);
            
            if (fileStats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
              images.push({
                id: `${category}-${file}`,
                url: `/uploads/${category}/${file}`,
                originalName: file,
                size: fileStats.size,
                category,
                uploadedAt: fileStats.birthtime.toISOString(),
                modifiedAt: fileStats.mtime.toISOString(),
                type: `image/${path.extname(file).substring(1).toLowerCase()}`,
                alt: '' // Will be filled from database if available
              });
            }
          }
        }
      }
    } catch (error) {
      console.log('No uploads directory or empty:', error.message);
    }

    // Sort by upload date (newest first)
    images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Filter by type if specified
    let filteredImages = type === 'all' ? images : images.filter(img => img.category === type);

    // Filter by search term
    if (search) {
      filteredImages = filteredImages.filter(img => 
        img.originalName.toLowerCase().includes(search.toLowerCase()) ||
        img.alt.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    console.log(`✅ Found ${filteredImages.length} images, returning ${paginatedImages.length}`);

    return NextResponse.json({
      success: true,
      images: paginatedImages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredImages.length / limit),
        totalCount: filteredImages.length,
        hasNextPage: endIndex < filteredImages.length,
        hasPrevPage: page > 1,
        limit
      },
      categories: [...new Set(images.map(img => img.category))],
      stats: {
        totalImages: images.length,
        totalSize: images.reduce((sum, img) => sum + img.size, 0),
        byCategory: images.reduce((acc, img) => {
          acc[img.category] = (acc[img.category] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('❌ Media gallery error:', error);
    return NextResponse.json({
      success: false,
      message: 'Medya galerisi yüklenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Bulk delete media files
export async function DELETE(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { imageIds } = await request.json();
    
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Geçersiz dosya ID\'leri' 
      }, { status: 400 });
    }

    console.log(`🗑️ Bulk deleting ${imageIds.length} files`);

    const results = [];
    
    for (const id of imageIds) {
      try {
        // Parse ID to get category and filename
        const [category, ...filenameParts] = id.split('-');
        const filename = filenameParts.join('-');

        if (!category || !filename) {
          results.push({ id, success: false, error: 'Geçersiz ID formatı' });
          continue;
        }

        const filePath = path.join(process.cwd(), 'public', 'uploads', category, filename);
        
        await unlink(filePath);
        results.push({ id, success: true });
        
      } catch (error) {
        console.error(`Delete error for ${id}:`, error);
        results.push({ 
          id, 
          success: false, 
          error: error.code === 'ENOENT' ? 'Dosya bulunamadı' : 'Silme hatası' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    console.log(`✅ Bulk delete completed: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      message: `${successCount} dosya silindi, ${failCount} hata`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      }
    });

  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json({
      success: false,
      message: 'Toplu silme işleminde hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}