'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleEditor from '../../../../components/admin/articles/ArticleEditor';

export default function CreateArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Mock user - mevcut auth sisteminizle uyumlu
  const user = { id: 1, name: 'Av. Murat YILMAZ' };

  const handleSave = async (articleData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const dataToSave = {
        ...articleData,
        authorId: user.id,
        authorName: user.name,
        status: 'draft'
      };

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Makale kaydedilemedi');
      }

      const savedArticle = await response.json();
      
      setSuccess('✅ Makale taslak olarak kaydedildi!');
      
      setTimeout(() => {
        router.push(`/admin/articles/${savedArticle.id}/edit`);
      }, 2000);

    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (articleData) => {
    try {
      setIsLoading(true);
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
        authorId: user.id,
        authorName: user.name,
        status: 'published',
        publishedAt: new Date().toISOString()
      };

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
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

      setSuccess('🎉 Makale başarıyla yayınlandı!');
      
      setTimeout(() => {
        router.push('/admin/articles');
      }, 2000);

    } catch (err) {
      console.error('Publish error:', err);
      setError(err.message || 'Yayınlama sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async (articleData) => {
    try {
      if (!articleData.title.trim()) return;

      const dataToAutoSave = {
        ...articleData,
        authorId: user.id,
        authorName: user.name,
        status: 'draft',
        isAutoSave: true
      };

      await fetch('/api/admin/articles/auto-save', {
        method: 'POST',
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

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">İşlem yapılıyor...</span>
          </div>
        </div>
      )}

      <ArticleEditor
        mode="create"
        initialData={{
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          metaTitle: '',
          metaDescription: '',
          focusKeyword: '',
          keywords: [],
          tags: [],
          category: 'genel',
          status: 'draft',
          allowComments: true
        }}
        onSave={handleSave}
        onPublish={handlePublish}
        onAutoSave={handleAutoSave}
      />
    </div>
  );
}