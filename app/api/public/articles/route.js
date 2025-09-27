// app/api/public/articles/route.js - Public Articles List API
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

// ✅ GET - Public articles list with filtering
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const exclude = searchParams.get('exclude'); // Exclude specific article ID
    const sortBy = searchParams.get('sortBy') || 'publishedAt'; // publishedAt, viewCount, title
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log(`📰 Public articles list request:`, { 
      page, limit, category, search, tag, exclude, sortBy, sortOrder 
    });

    // Build filter query
    const filter = {
      status: 'published',
      publishedAt: { $lte: new Date() }
    };

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Exclude specific article
    if (exclude) {
      filter._id = { $ne: exclude };
    }

    // Tag filter
    if (tag) {
      filter.tags = { $in: [tag] };
    }

    // Search filter
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [articles, totalCount] = await Promise.all([
      Article.find(filter)
        .select('title slug excerpt featuredImage featuredImageAlt category publishedAt viewCount readingTime tags seoScore template')
        .populate('author', 'name')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Article.countDocuments(filter)
    ]);

    // Format articles
    const formattedArticles = articles.map(article => ({
      ...article,
      categoryLabel: getCategoryLabel(article.category),
      templateLabel: getTemplateLabel(article.template),
      formattedDate: formatDate(article.publishedAt),
      readingTimeText: `${article.readingTime} dk okuma`,
      viewCountText: formatViewCount(article.viewCount),
      excerpt: article.excerpt || generateExcerpt(article.content)
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get popular articles (for sidebar)
    const popularArticles = await Article.find({
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
    .select('title slug viewCount category publishedAt')
    .populate('author', 'name')
    .sort({ viewCount: -1 })
    .limit(5)
    .lean();

    // Get latest articles by category
    const latestByCategory = {};
    const categories = ['aile-hukuku', 'ceza-hukuku', 'is-hukuku', 'ticaret-hukuku'];
    
    for (const cat of categories) {
      const latestInCategory = await Article.findOne({
        category: cat,
        status: 'published',
        publishedAt: { $lte: new Date() }
      })
      .select('title slug featuredImage category publishedAt')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .lean();
      
      if (latestInCategory) {
        latestByCategory[cat] = {
          ...latestInCategory,
          categoryLabel: getCategoryLabel(latestInCategory.category),
          formattedDate: formatDate(latestInCategory.publishedAt)
        };
      }
    }

    console.log(`✅ Articles served: ${formattedArticles.length} articles (page ${page}/${totalPages})`);

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      },
      meta: {
        popularArticles: popularArticles.map(article => ({
          ...article,
          categoryLabel: getCategoryLabel(article.category),
          formattedDate: formatDate(article.publishedAt),
          viewCountText: formatViewCount(article.viewCount)
        })),
        latestByCategory,
        searchQuery: search,
        categoryFilter: category,
        tagFilter: tag
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache
      }
    });

  } catch (error) {
    console.error('❌ Public articles list error:', error);
    return NextResponse.json({
      success: false,
      message: 'Makaleler yüklenirken hata oluştu'
    }, { status: 500 });
  }
}

// ✅ Helper functions
function getCategoryLabel(category) {
  const categoryMap = {
    'genel': 'Genel',
    'aile-hukuku': 'Aile Hukuku',
    'ceza-hukuku': 'Ceza Hukuku',
    'is-hukuku': 'İş Hukuku',
    'ticaret-hukuku': 'Ticaret Hukuku',
    'idare-hukuku': 'İdare Hukuku',
    'icra-hukuku': 'İcra Hukuku',
    'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
    'miras-hukuku': 'Miras Hukuku',
    'kvkk': 'KVKK',
    'sigorta-hukuku': 'Sigorta Hukuku'
  };
  return categoryMap[category] || category;
}

function getTemplateLabel(template) {
  const templateMap = {
    'standard': 'Standart Makale',
    'legal-article': 'Hukuki Makale',
    'case-study': 'Vaka Analizi',
    'legal-guide': 'Hukuk Rehberi',
    'news': 'Hukuk Haberi'
  };
  return templateMap[template] || template;
}

function formatDate(date) {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatViewCount(count) {
  if (!count) return '0';
  
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function generateExcerpt(content, maxLength = 150) {
  if (!content) return '';
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}