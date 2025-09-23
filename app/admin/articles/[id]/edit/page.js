'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import ArticleEditor from '../../../../components/admin/articles/ArticleEditor';
import { useAuth } from '../../../../hooks/useAuth'; // Auth hook'u varsa

export default function EditArticlePage({ params }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Auth bilgisi - gerçek uygulamada auth hook'undan gelecek
  // const { user } = useAuth();
  const user = { id: 1, name: 'Av. Murat YILMAZ' }; // Mock user
  
  const articleId = params.id;

  // Makale verilerini çek
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`/api/admin/articles/${articleId}`);
        
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

      // API call to update article
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Makale güncellenemedi');
      }

      const updatedArticle = await response.json();
      setArticle(updatedArticle);
      
      setSuccess('✅ Makale başarıyla kaydedildi!');
      
      // Success mesajını 3 saniye sonra kapat
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

      // Validation checks
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
        publishedAt: articleData.status !== 'published' ? new Date().toISOString() : articleData.publishedAt
      };

      // API call to publish article
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToPublish),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Makale yayınlanamadı');
      }

      const publishedArticle = await response.json();
      setArticle(publishedArticle);
      
      setSuccess(articleData.status !== 'published' ? '🎉 Makale başarıyla yayınlandı!' : '✅ Yayınlanan makale güncellendi!');
      
      // Success mesajını 3 saniye sonra kapat
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
      // Auto-save sadece değişiklik varsa çalışsın
      if (!articleData.title.trim()) return;

      const dataToAutoSave = {
        ...articleData,
        lastEditedBy: user.id,
        isAutoSave: true
      };

      // Auto-save API call (daha hafif, hata handling'i sessiz)
      await fetch(`/api/admin/articles/${articleId}/auto-save`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToAutoSave),
      });

    } catch (err) {
      // Auto-save hatalarını sessizce geç
      console.log('Auto-save failed:', err);
    }
  };

  // Yükleniyor ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Makale Yükleniyor</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  // Makale bulunamadı
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">📄</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Makale Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Bu makale mevcut değil veya silinmiş olabilir.</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Makale Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {success}
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-4 text-white hover:text-gray-200 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Kaydediliyor...</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
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

      {/* Article Editor */}
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

      {/* Article Info Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>
                <strong>Yazar:</strong> {article.authorName}
              </span>
              <span>
                <strong>Oluşturma:</strong> {new Date(article.createdAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span>
                <strong>Güncelleme:</strong> {new Date(article.updatedAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric', 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {article.status === 'published' && (
                <a
                  href={`/makaleler/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Yayında Görüntüle →
                </a>
              )}
              <span>ID: #{article.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}