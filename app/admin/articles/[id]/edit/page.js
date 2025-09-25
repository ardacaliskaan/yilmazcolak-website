'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import ArticleEditor from '../../../../../components/admin/articles/ArticleEditor';

export default function EditArticlePage({ params }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Mock user - mevcut auth sisteminizle uyumlu
  const user = { id: 1, name: 'Av. Murat YILMAZ' };
  
  const articleId = params.id;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`/api/admin/articles/${articleId}`, {
          credentials: 'include'
        });
        
        if (response.status === 404) {
          notFound();
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Makale yüklenemedi');
        }

        const articleData = await response.json();
        setArticle(articleData);
        
      } catch (err) {
        console.error('Fetch article error:', err);
        setError(err.message || 'Makale yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleSave = async (articleData) => {
    try {
      setIsSaving(true);
      setError('');
      
      const dataToSave = {
        ...articleData,
        lastEditedBy: user.id,
        status: articleData.status || 'draft'
      };

      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Makale güncellenemedi');
      }

      const updatedArticle = await response.json();
      setArticle(updatedArticle);
      
      setSuccess('✅ Makale başarıyla kaydedildi!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Kaydetme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (articleData) => {
    try {
      setIsSaving(true);
      setError('');

      if (!articleData.title.trim()) {
        throw new Error('Makale başlığı gereklidir.');
      }
      
      if (!articleData.excerpt.trim()) {
        throw new Error('Makale özeti gereklidir.');
      }
      
      if (!articleData.content.trim()) {
        throw new Error('Makale içeriği gereklidir.');
      }

      if (!articleData.metaDescription.trim()) {
        throw new Error('SEO meta açıklaması gereklidir.');
      }

      const dataToPublish = {
        ...articleData,
        lastEditedBy: user.id,
        status: 'published',
        publishedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToPublish),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Makale yayınlanamadı');
      }

      const publishedArticle = await response.json();
      setArticle(publishedArticle);
      
      setSuccess('🎉 Makale başarıyla yayınlandı!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Publish error:', err);
      setError(err.message || 'Yayınlama sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async (articleData) => {
    try {
      if (!articleData.title.trim()) return;

      const dataToAutoSave = {
        ...articleData,
        lastEditedBy: user.id,
        status: 'draft',
        isAutoSave: true
      };

      await fetch(`/api/admin/articles/${articleId}/auto-save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToAutoSave),
      });

    } catch (err) {
      console.log('Auto-save failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Makale yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Makale bulunamadı</p>
          {error && <p className="text-gray-600 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {success}
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Kaydediliyor...</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 text-sm">
            <button
              onClick={() => router.push('/admin/articles')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Makaleler
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Düzenle</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-md">
              {article.title}
            </span>
          </div>
        </div>
      </div>

      <ArticleEditor
        mode="edit"
        initialData={{
          title: article.title || '',
          slug: article.slug || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          metaTitle: article.metaTitle || '',
          metaDescription: article.metaDescription || '',
          focusKeyword: article.focusKeyword || '',
          keywords: article.keywords || [],
          tags: article.tags || [],
          category: article.category || 'genel',
          status: article.status || 'draft',
          allowComments: article.allowComments !== false,
          scheduledAt: article.scheduledAt || '',
          featuredImage: article.featuredImage || ''
        }}
        onSave={handleSave}
        onPublish={handlePublish}
        onAutoSave={handleAutoSave}
      />
    </div>
  );
}