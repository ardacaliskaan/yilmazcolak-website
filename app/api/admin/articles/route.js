// app/api/admin/articles/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// GET - Makale listesi (pagination + filtering)
export async function GET(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'articles', 'read'))) {
      return NextResponse.json({ message: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    console.log(`📄 Articles list requested by: ${session.user.name} (${session.user.role})`);

    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const author = searchParams.get('author');

    // Build filter query
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (author) {
      filter.author = author;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [articles, totalCount] = await Promise.all([
      Article.find(filter)
        .populate('author', 'name email')
        .populate('lastEditedBy', 'name')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Statistics
    const stats = await Article.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          avgSeoScore: { $avg: '$seoScore' },
          avgReadabilityScore: { $avg: '$readabilityScore' }
        }
      }
    ]);

    const statsFormatted = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalViews: stat.totalViews || 0,
        avgSeoScore: Math.round(stat.avgSeoScore || 0),
        avgReadabilityScore: Math.round(stat.avgReadabilityScore || 0)
      };
      return acc;
    }, {});

    console.log(`✅ ${articles.length} article returned (${totalCount} total)`);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      },
      stats: statsFormatted,
      filters: {
        status,
        category,
        search,
        sortBy,
        sortOrder
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GET /api/admin/articles error:', error);
    return NextResponse.json({
      success: false,
      message: 'Makaleler yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Yeni makale oluştur
export async function POST(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Dinamik yetki kontrolü
    if (!(await hasPermission(session.user, 'articles', 'create'))) {
      return NextResponse.json({ message: 'Makale oluşturma yetkiniz yok' }, { status: 403 });
    }

    console.log(`📝 New article creation by: ${session.user.name} (${session.user.role})`);

    await dbConnect();

    const body = await request.json();
    
    // Validation
    const requiredFields = ['title', 'excerpt', 'content', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]?.trim());
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        message: `Gerekli alanlar eksik: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Check for duplicate slug
    if (body.slug) {
      const existingArticle = await Article.findOne({ slug: body.slug });
      if (existingArticle) {
        console.log('❌ Duplicate slug:', body.slug);
        return NextResponse.json({
          success: false,
          message: 'Bu URL slug zaten kullanılıyor. Lütfen farklı bir slug seçin.',
          field: 'slug'
        }, { status: 400 });
      }
    }

    // Create article data
    const articleData = {
      title: body.title.trim(),
      slug: body.slug || undefined, // Let model generate if empty
      excerpt: body.excerpt.trim(),
      content: body.content.trim(),
      metaTitle: body.metaTitle?.trim() || body.title.trim(),
      metaDescription: body.metaDescription?.trim(),
      focusKeyword: body.focusKeyword?.trim(),
      keywords: Array.isArray(body.keywords) ? body.keywords.filter(k => k.trim()) : [],
      tags: Array.isArray(body.tags) ? body.tags.filter(t => t.trim()) : [],
      category: body.category,
      author: session.user.id, // Auth'dan al
      authorName: session.user.name, // Auth'dan al
      status: body.status || 'draft',
      featuredImage: body.featuredImage?.trim(),
      allowComments: body.allowComments !== false,
      template: body.template || 'standard'
    };

    // Set published date if publishing
    if (body.status === 'published') {
      articleData.publishedAt = new Date();
    } else if (body.status === 'scheduled' && body.scheduledAt) {
      articleData.scheduledAt = new Date(body.scheduledAt);
    }

    // Create article
    const article = new Article(articleData);
    await article.save();

    // Populate author info
    await article.populate('author', 'name email');

    const statusText = article.status === 'published' ? 'yayınlandı' : 'kaydedildi';
    
    console.log(`✅ Article ${statusText}: ${article.title} (ID: ${article._id})`);
    console.log(`📊 Article stats - Words: ${article.wordCount}, SEO: ${article.seoScore}%, Readability: ${article.readabilityScore}%`);

    return NextResponse.json({
      success: true,
      message: `Makale ${statusText}.`,
      article: article
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/admin/articles error:', error);
    
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

    // Handle duplicate key error (slug)
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
      message: 'Makale oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}