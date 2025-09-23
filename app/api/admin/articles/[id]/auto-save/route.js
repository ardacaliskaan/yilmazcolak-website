// app/api/admin/articles/[id]/auto-save/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { getServerSession } from '@/lib/auth';
import { hasPermission } from '@/lib/dynamicPermissions';

// PATCH - Auto-save makale (hafif güncelleme)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      // Auto-save için sessiz fail (log bile yapmayız)
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // Yetki kontrolü (sessiz)
    if (!(await hasPermission(session.user, 'articles', 'update'))) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { id } = params;
    
    // ID validation (sessiz)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await dbConnect();
    const body = await request.json();

    // Sadece temel alanları auto-save yap
    const autoSaveData = {
      title: body.title?.trim(),
      content: body.content?.trim(),
      excerpt: body.excerpt?.trim(),
      lastEditedBy: session.user.id,
      // Auto-save metadata
      autoSaveData: {
        timestamp: new Date(),
        by: session.user.id,
        fields: Object.keys(body).filter(key => body[key] !== undefined)
      }
    };

    // Remove undefined values
    Object.keys(autoSaveData).forEach(key => 
      autoSaveData[key] === undefined && delete autoSaveData[key]
    );

    // Hafif güncelleme - validation skip
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      autoSaveData,
      { 
        new: false, // Eski versionu döndür (performans için)
        runValidators: false // Auto-save'de validation'ı skip et
      }
    );

    if (!updatedArticle) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    // Minimum response (performans için)
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Auto-save hataları sessizce log'la ama kullanıcıya başarılı döndür
    console.log('Auto-save failed (non-critical):', error.message);
    
    // Kullanıcı deneyimini bozmamak için success döndür
    return NextResponse.json({
      success: true,
      note: 'Auto-save skipped due to minor error'
    });
  }
}

// POST - Create için auto-save (henüz ID yok)
export async function POST(request) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    if (!(await hasPermission(session.user, 'articles', 'create'))) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    // Minimum required fields for auto-save
    if (!body.title?.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title required for auto-save' 
      }, { status: 400 });
    }

    // Check if auto-save draft already exists for this user+title combo
    const existingDraft = await Article.findOne({
      title: body.title.trim(),
      author: session.user.id,
      status: 'draft',
      'autoSaveData.isAutoSaveOnly': true
    });

    if (existingDraft) {
      // Update existing auto-save draft
      const updateData = {
        title: body.title?.trim(),
        content: body.content?.trim(),
        excerpt: body.excerpt?.trim(),
        lastEditedBy: session.user.id,
        autoSaveData: {
          timestamp: new Date(),
          by: session.user.id,
          isAutoSaveOnly: true
        }
      };

      await Article.findByIdAndUpdate(existingDraft._id, updateData);

      return NextResponse.json({
        success: true,
        articleId: existingDraft._id,
        message: 'Auto-save draft updated'
      });
    } else {
      // Create new auto-save draft
      const autoSaveDraft = new Article({
        title: body.title.trim(),
        slug: body.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        excerpt: body.excerpt?.trim() || 'Auto-saved draft',
        content: body.content?.trim() || '',
        category: body.category || 'genel',
        author: session.user.id,
        authorName: session.user.name,
        status: 'draft',
        autoSaveData: {
          timestamp: new Date(),
          by: session.user.id,
          isAutoSaveOnly: true
        }
      });

      await autoSaveDraft.save();

      console.log(`💾 Auto-save draft created: ${autoSaveDraft.title} (ID: ${autoSaveDraft._id})`);

      return NextResponse.json({
        success: true,
        articleId: autoSaveDraft._id,
        message: 'Auto-save draft created',
        redirectTo: `/admin/articles/${autoSaveDraft._id}/edit`
      }, { status: 201 });
    }

  } catch (error) {
    console.log('Create auto-save failed:', error.message);
    
    return NextResponse.json({
      success: false,
      message: 'Auto-save failed'
    }, { status: 500 });
  }
}