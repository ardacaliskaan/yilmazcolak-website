// app/api/public/articles/route.js - Public Blog Articles API (No Auth Required)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

// GET - Public blog articles (SEO optimized)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const latest = searchParams.get('latest') === 'true';
    const popular = searchParams.get('popular') === 'true';
    const related = searchParams.get('related'); // Article ID for related articles

    // Build filter query - Only published articles
    let filter = { 
      status: 'published',
      isIndexable: { $ne: false } // SEO: Only indexable articles
    };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (featured) {
      filter.isFeatured = true;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Handle related articles
    if (related && mongoose.Types.ObjectId.isValid(related)) {
      const relatedArticle = await Article.findById(related).select('category tags keywords');
      if (relatedArticle) {
        filter._id = { $ne: related }; // Exclude current article
        filter.$or = [
          { category: relatedArticle.category },
          { tags: { $in: relatedArticle.tags } },
          { keywords: { $in: relatedArticle.keywords } }
        ];
      }
    }

    // Build sort query
    let sortQuery = {};
    if (latest) {
      sortQuery = { publishedAt: -1, createdAt: -1 };
    } else if (popular) {
      sortQuery = { viewCount: -1, publishedAt: -1 };
    } else if (featured) {
      sortQuery = { isFeatured: -1, publishedAt: -1 };
    } else {
      sortQuery = { publishedAt: -1 }; // Default: newest first
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [articles, totalCount] = await Promise.all([
      Article.find(filter)
        .select(`
          title slug excerpt category publishedAt readingTime viewCount 
          featuredImage tags isFeatured seoScore readabilityScore authorName
          metaTitle metaDescription focusKeyword
        `)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);

    // Add computed fields for SEO
    const enhancedArticles = articles.map(article => ({
      ...article,
      url: `/makaleler/${article.slug}`,
      categoryName: getCategoryName(article.category),
      publishedDate: article.publishedAt,
      formattedDate: new Date(article.publishedAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`,
      estimatedReadTime: Math.ceil(article.wordCount / 200) || article.readingTime,
      // SEO indicators
      seoQuality: article.seoScore >= 80 ? 'excellent' : article.seoScore >= 60 ? 'good' : 'needs-improvement',
      readabilityLevel: article.readabilityScore >= 80 ? 'easy' : article.readabilityScore >= 60 ? 'medium' : 'hard'
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get featured articles for sidebar/widgets
    const featuredArticles = featured ? [] : await Article.find({
      status: 'published',
      isFeatured: true,
      isIndexable: { $ne: false }
    })
    .select('title slug excerpt featuredImage publishedAt viewCount')
    .sort({ publishedAt: -1 })
    .limit(5)
    .lean();

    // Get popular articles
    const popularArticles = popular ? [] : await Article.find({
      status: 'published',
      isIndexable: { $ne: false },
      viewCount: { $gte: 100 }
    })
    .select('title slug viewCount publishedAt')
    .sort({ viewCount: -1, publishedAt: -1 })
    .limit(5)
    .lean();

    // Get categories with article counts
    const categoriesWithCounts = await Article.aggregate([
      { $match: { status: 'published', isIndexable: { $ne: false } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoriesFormatted = categoriesWithCounts.map(cat => ({
      slug: cat._id,
      name: getCategoryName(cat._id),
      count: cat.count,
      url: `/makaleler?category=${cat._id}`
    }));

    // Response with caching headers
    const response = NextResponse.json({
      success: true,
      articles: enhancedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
        showing: `${skip + 1}-${skip + enhancedArticles.length}`,
        total: totalCount
      },
      meta: {
        featured: featuredArticles.map(article => ({
          ...article,
          url: `/makaleler/${article.slug}`
        })),
        popular: popularArticles.map(article => ({
          ...article,
          url: `/makaleler/${article.slug}`
        })),
        categories: categoriesFormatted,
        filters: {
          category,
          search,
          featured,
          latest,
          popular
        }
      },
      seo: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler${category ? `?category=${category}` : ''}`,
        robots: 'index,follow',
        lastModified: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

    // Performance & SEO headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Robots-Tag', 'index, follow');
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;

  } catch (error) {
    console.error('❌ Public articles API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Articles could not be loaded',
      articles: [],
      pagination: null,
      meta: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }
}

// Helper function for category names
function getCategoryName(category) {
  const categoryMap = {
    'aile-hukuku': 'Aile Hukuku',
    'ceza-hukuku': 'Ceza Hukuku',
    'is-hukuku': 'İş Hukuku',
    'ticaret-hukuku': 'Ticaret Hukuku',
    'idare-hukuku': 'İdare Hukuku',
    'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
    'miras-hukuku': 'Miras Hukuku',
    'icra-hukuku': 'İcra Hukuku',
    'kvkk': 'KVKK',
    'sigorta-hukuku': 'Sigorta Hukuku',
    'genel': 'Genel'
  };
  return categoryMap[category] || 'Genel';
}