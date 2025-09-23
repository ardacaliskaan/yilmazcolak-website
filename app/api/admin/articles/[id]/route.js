// app/api/admin/articles/[id]/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// Helper functions
const getCategoryName = (category) => {
  const categoryMap = {
    'aile-hukuku': 'Aile Hukuku',
    'ceza-hukuku': 'Ceza Hukuku',
    'is-hukuku': 'İş Hukuku',
    'ticaret-hukuku': 'Ticaret Hukuku',
    'idare-hukuku': 'İdare Hukuku',
    'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
    'miras-hukuku': 'Miras Hukuku',
    'kvkk': 'KVKK',
    'icra-hukuku': 'İcra Hukuku',
    'genel': 'Genel'
  };
  return categoryMap[category] || 'Genel';
};

const getStatusLabel = (status) => {
  const statusMap = {
    'draft': { label: 'Taslak', color: 'yellow' },
    'published': { label: 'Yayında', color: 'green' },
    'scheduled': { label: 'Zamanlanmış', color: 'blue' },
    'archived': { label: 'Arşiv', color: 'gray' }
  };
  return statusMap[status] || statusMap.draft;
};

// GET - Tekil makale getir
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'articles', 'read'))) {
      return NextResponse.json({ message: 'Makale görüntüleme yetkiniz yok' }, { status: 403 });
    }

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid article ID:', id);
      return NextResponse.json({
        success: false,
        message: 'Geçersiz makale ID\'si'
      }, { status: 400 });
    }

    console.log(`📄 Article fetch requested: ${id} by ${session.user.name}`);

    await dbConnect();

    // Find article
    const article = await Article.findById(id)
      .populate('author', 'name email avatar')
      .populate('lastEditedBy', 'name email')
      .lean();

    if (!article) {
      console.log('❌ Article not found:', id);
      return NextResponse.json({
        success: false,
        message: 'Makale bulunamadı'
      }, { status: 404 });
    }

    // Check permissions for editing
    const canEdit = await hasPermission(session.user, 'articles', 'update');
    const canDelete = await hasPermission(session.user, 'articles', 'delete');
    const canPublish = await hasPermission(session.user, 'articles', 'publish');

    // Add computed fields
    const enrichedArticle = {
      ...article,
      url: `/makaleler/${article.slug}`,
      categoryName: getCategoryName(article.category),
      statusLabel: getStatusLabel(article.status),
      estimatedReadingTime: Math.ceil(article.wordCount / 200),
      lastModified: article.updatedAt,
      isPublished: article.status === 'published',
      permissions: {
        canEdit,
        canDelete,
        canPublish
      }
    };

    console.log(`✅ Article found: ${article.title} (${article.status})`);
    console.log(`🔐 User permissions - Edit: ${canEdit}, Delete: ${canDelete}, Publish: ${canPublish}`);

    return NextResponse.json({
      success: true,
      article: enrichedArticle,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GET /api/admin/articles/[id] error:', error);
    return NextResponse.json({
      success: false,
      message: 'Makale yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Makale güncelle
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'articles', 'update'))) {
      return NextResponse.json({ message: 'Makale güncelleme yetkiniz yok' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid article ID for update:', id);
      return NextResponse.json({
        success: false,
        message: 'Geçersiz makale ID\'si'
      }, { status: 400 });
    }

    console.log(`📝 Article update requested: ${id} by ${session.user.name}`);

    await dbConnect();

    // Check if article exists
    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      console.log('❌ Article not found for update:', id);
      return NextResponse.json({
        success: false,
        message: 'Güncellenecek makale bulunamadı'
      }, { status: 404 });
    }

    // Validation for required fields
    if (body.status === 'published') {
      const requiredFields = ['title', 'excerpt', 'content', 'metaDescription'];
      const missingFields = requiredFields.filter(field => !body[field]?.trim());
      
      if (missingFields.length > 0) {
        console.log('❌ Missing required fields for publish:', missingFields);
        return NextResponse.json({
          success: false,
          message: `Yayın için gerekli alanlar eksik: ${missingFields.join(', ')}`,
          missingFields
        }, { status: 400 });
      }
    }

    // Check for duplicate slug (if slug is being changed)
    if (body.slug && body.slug !== existingArticle.slug) {
      const duplicateArticle = await Article.findOne({ 
        slug: body.slug, 
        _id: { $ne: id } 
      });
      
      if (duplicateArticle) {
        console.log('❌ Duplicate slug on update:', body.slug);
        return NextResponse.json({
          success: false,
          message: 'Bu URL slug zaten başka bir makale tarafından kullanılıyor',
          field: 'slug'
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData = {
      title: body.title?.trim(),
      slug: body.slug?.trim(),
      excerpt: body.excerpt?.trim(),
      content: body.content?.trim(),
      metaTitle: body.metaTitle?.trim(),
      metaDescription: body.metaDescription?.trim(),
      focusKeyword: body.focusKeyword?.trim(),
      keywords: Array.isArray(body.keywords) ? body.keywords.filter(k => k.trim()) : undefined,
      tags: Array.isArray(body.tags) ? body.tags.filter(t => t.trim()) : undefined,
      category: body.category,
      status: body.status,
      featuredImage: body.featuredImage?.trim(),
      allowComments: body.allowComments,
      template: body.template,
      lastEditedBy: session.user.id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Handle status changes
    if (body.status === 'published' && existingArticle.status !== 'published') {
      updateData.publishedAt = new Date();
      console.log('🚀 Article being published for first time');
    } else if (body.status === 'scheduled') {
      if (body.scheduledAt) {
        updateData.scheduledAt = new Date(body.scheduledAt);
        updateData.publishedAt = null;
      }
    } else if (body.status === 'draft') {
      updateData.scheduledAt = null;
      // Keep publishedAt if it was published before
    }

    // Update article
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('author', 'name email')
     .populate('lastEditedBy', 'name email');

    const statusText = updatedArticle.status === 'published' ? 'yayınlandı' : 'güncellendi';
    
    console.log(`✅ Article ${statusText}: ${updatedArticle.title}`);
    console.log(`📊 Updated stats - Words: ${updatedArticle.wordCount}, SEO: ${updatedArticle.seoScore}%`);

    return NextResponse.json({
      success: true,
      message: `Makale ${statusText}.`,
      article: updatedArticle,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ PUT /api/admin/articles/[id] error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return NextResponse.json({
        success: false,
        message: 'Validasyon hatası',
        errors: validationErrors
      }, { status: 400 });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json({
        success: false,
        message: `${field === 'slug' ? 'URL slug' : field} zaten kullanılıyor`,
        field
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Makale güncellenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Makale sil
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'articles', 'delete'))) {
      return NextResponse.json({ message: 'Makale silme yetkiniz yok' }, { status: 403 });
    }

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid article ID for delete:', id);
      return NextResponse.json({
        success: false,
        message: 'Geçersiz makale ID\'si'
      }, { status: 400 });
    }

    console.log(`🗑️ Article delete requested: ${id} by ${session.user.name}`);

    await dbConnect();

    // Check if article exists
    const article = await Article.findById(id);
    if (!article) {
      console.log('❌ Article not found for delete:', id);
      return NextResponse.json({
        success: false,
        message: 'Silinecek makale bulunamadı'
      }, { status: 404 });
    }

    // Soft delete için status'u archived yap (gerçek delete yerine)
    // await article.deleteOne(); // Hard delete
    
    // Soft delete (recommended)
    article.status = 'archived';
    article.lastEditedBy = session.user.id;
    await article.save();

    console.log(`✅ Article archived (soft delete): ${article.title}`);
    console.log(`👤 Deleted by: ${session.user.name} (${session.user.role})`);

    return NextResponse.json({
      success: true,
      message: 'Makale başarıyla silindi',
      article: { id: article._id, title: article.title },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DELETE /api/admin/articles/[id] error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Makale silinirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}