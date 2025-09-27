// app/api/public/articles/[slug]/route.js - Public Article API
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

// ✅ GET - Single article by slug (public)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Slug parametresi gerekli'
      }, { status: 400 });
    }

    console.log(`📖 Public article request: ${slug}`);

    // Find published article by slug
    const article = await Article.findOne({
      slug,
      status: 'published',
      publishedAt: { $lte: new Date() }
    })
    .populate('author', 'name')
    .lean();

    if (!article) {
      return NextResponse.json({
        success: false,
        message: 'Makale bulunamadı'
      }, { status: 404 });
    }

    // Increment view count (async, don't wait)
    Article.findByIdAndUpdate(article._id, { 
      $inc: { viewCount: 1 } 
    }).catch(err => console.error('View count update failed:', err));

    // Get related articles (same category, exclude current)
    const relatedArticles = await Article.find({
      category: article.category,
      status: 'published',
      publishedAt: { $lte: new Date() },
      _id: { $ne: article._id }
    })
    .select('title slug excerpt featuredImage category publishedAt viewCount readingTime')
    .populate('author', 'name')
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

    // Format response
    const formattedArticle = {
      ...article,
      categoryLabel: getCategoryLabel(article.category),
      statusLabel: getStatusLabel(article.status),
      templateLabel: getTemplateLabel(article.template),
      formattedDate: formatDate(article.publishedAt),
      relatedArticles: relatedArticles.map(related => ({
        ...related,
        categoryLabel: getCategoryLabel(related.category),
        formattedDate: formatDate(related.publishedAt)
      }))
    };

    console.log(`✅ Article served: ${article.title} (${article.viewCount + 1} views)`);

    return NextResponse.json({
      success: true,
      article: formattedArticle
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache
      }
    });

  } catch (error) {
    console.error('❌ Public article fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Makale yüklenirken hata oluştu'
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

function getStatusLabel(status) {
  const statusMap = {
    'draft': 'Taslak',
    'published': 'Yayında',
    'scheduled': 'Zamanlanmış',
    'archived': 'Arşiv'
  };
  return statusMap[status] || status;
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