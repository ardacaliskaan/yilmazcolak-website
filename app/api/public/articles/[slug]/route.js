// app/api/public/articles/[slug]/route.js - Public Single Article API
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Slug parameter is required',
        article: null
      }, { status: 400 });
    }

    console.log(`📄 Public article requested: ${slug}`);

    // Find published article by slug
    const article = await Article.findOne({ 
      slug: slug,
      status: 'published',
      isIndexable: { $ne: false } // Only indexable articles
    })
    .populate('author', 'name email slug bio')
    .lean();

    if (!article) {
      console.log(`❌ Article not found or not published: ${slug}`);
      return NextResponse.json({
        success: false,
        message: 'Article not found',
        article: null
      }, { 
        status: 404,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      });
    }

    // Increment view count (non-blocking)
    Article.findByIdAndUpdate(article._id, { 
      $inc: { viewCount: 1 } 
    }).exec().catch(err => {
      console.log('View count update failed (non-critical):', err.message);
    });

    // Add computed fields
    const enrichedArticle = {
      ...article,
      url: `/makaleler/${article.slug}`,
      categoryName: getCategoryName(article.category),
      estimatedReadingTime: Math.ceil(article.wordCount / 200),
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`,
      formattedPublishDate: new Date(article.publishedAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      isRecent: isRecentArticle(article.publishedAt),
      seoQuality: article.seoScore >= 80 ? 'excellent' : article.seoScore >= 60 ? 'good' : 'needs-improvement',
      readabilityLevel: article.readabilityScore >= 80 ? 'easy' : article.readabilityScore >= 60 ? 'medium' : 'hard'
    };

    console.log(`✅ Article served: ${article.title} (Views: ${article.viewCount + 1})`);

    const response = NextResponse.json({
      success: true,
      article: enrichedArticle,
      meta: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`,
        robots: 'index,follow',
        lastModified: article.updatedAt || article.publishedAt,
        nextUpdate: getNextUpdateTime(article.updatedAt)
      },
      timestamp: new Date().toISOString()
    });

    // Performance & SEO headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large');
    response.headers.set('Vary', 'Accept-Encoding');
    response.headers.set('Last-Modified', new Date(article.updatedAt || article.publishedAt).toUTCString());
    
    return response;

  } catch (error) {
    console.error('❌ Public single article API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Article could not be loaded',
      article: null,
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

// PATCH - Increment view count (separate endpoint for client-side tracking)
export async function PATCH(request, { params }) {
  try {
    await dbConnect();

    const { slug } = params;
    
    // Find and increment view count
    const article = await Article.findOneAndUpdate(
      { 
        slug: slug,
        status: 'published'
      },
      { 
        $inc: { viewCount: 1 },
        $set: { lastViewed: new Date() }
      },
      { new: false } // Return old document for performance
    ).select('_id viewCount title');

    if (!article) {
      return NextResponse.json({
        success: false,
        message: 'Article not found'
      }, { status: 404 });
    }

    console.log(`👁️ View count incremented for: ${article.title} (${article.viewCount + 1})`);

    return NextResponse.json({
      success: true,
      viewCount: article.viewCount + 1,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('View count increment error:', error);
    
    // Don't fail the request for view count errors
    return NextResponse.json({
      success: false,
      message: 'View count update failed',
      note: 'Non-critical error'
    });
  }
}

// Helper Functions
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

function isRecentArticle(publishedAt) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return new Date(publishedAt) > oneMonthAgo;
}

function getNextUpdateTime(lastUpdate) {
  // Suggest next cache update time based on article age
  const now = new Date();
  const updated = new Date(lastUpdate);
  const ageInDays = (now - updated) / (1000 * 60 * 60 * 24);
  
  if (ageInDays < 1) {
    // Very recent articles - update every hour
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  } else if (ageInDays < 7) {
    // Recent articles - update every 6 hours
    return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
  } else {
    // Older articles - update daily
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
}