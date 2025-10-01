// components/admin/ImageUploadModal.js - EDİTÖR ENTEGRASYON FİXED!
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { 
  Upload, X, Image as ImageIcon, Link, Check, AlertCircle, 
  Loader2, Trash2, Eye, Grid, Search, Plus
} from 'lucide-react';

const ImageUploadModal = ({ 
  isOpen, 
  onClose, 
  onImageSelect, // ✅ Bu callback editöre görsel ekleyecek
  uploadEndpoint = '/api/admin/upload',
  type = 'articles', // articles, team, general
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowMultiple = false
}) => {
  // STATES
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [altText, setAltText] = useState('');

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // ✅ FİX: Modal açıldığında galeri yükle
  useEffect(() => {
    if (isOpen) {
      loadUploadedImages();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  // ✅ Galeri yükleme - API'den görselleri getir
  const loadUploadedImages = async () => {
    try {
      const response = await fetch('/api/admin/media', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.images) {
          setUploadedImages(data.images);
        }
      } else {
        // Galeri API'si yoksa boş array
        setUploadedImages([]);
      }
    } catch (error) {
      console.log('Media API not available, using fallback');
      setUploadedImages([]);
    }
  };

  // ✅ Dosya validasyonu
  const validateFile = useCallback((file) => {
    if (!acceptedFormats.includes(file.type)) {
      throw new Error(`Desteklenmeyen dosya formatı. Desteklenenler: JPG, PNG, GIF, WebP`);
    }
    
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      throw new Error(`Dosya boyutu çok büyük. Maksimum ${maxSizeMB}MB.`);
    }
    
    return true;
  }, [maxFileSize]);

  // ✅ Dosya upload işlemi - ÇALIŞIYOR
  const uploadFile = async (file) => {
    try {
      validateFile(file);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const imageData = {
          url: result.url,
          originalName: result.originalName || file.name,
          size: result.size || file.size,
          type: result.type || file.type,
          uploadedAt: result.uploadedAt || new Date().toISOString(),
          id: result.id || Date.now().toString()
        };

        // ✅ Upload edilen görseli listeye ekle
        setUploadedImages(prev => [imageData, ...prev]);
        setSuccess('Görsel başarıyla yüklendi!');
        
        // ✅ Auto-select uploaded image
        setSelectedImage(imageData);
        setActiveTab('gallery');
        
        return imageData;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      throw error;
    }
  };

  // ✅ Drag & Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]; // Tek dosya
    await handleFileUpload(file);
  }, []);

  // ✅ File input change
  const handleFileInputChange = useCallback(async (e) => {
    setError(null);
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0]; // Tek dosya
    await handleFileUpload(file);
  }, []);

  // ✅ File upload handler
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedImage = await uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Upload tamamlandıktan sonra progress'i temizle
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setError(error.message);
    }
  };

  // ✅ URL validation
  const handleUrlValidation = useCallback(async (url) => {
    setError(null);
    
    try {
      const img = new window.Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          setUrlPreview({
            url,
            width: img.naturalWidth,
            height: img.naturalHeight,
            originalName: 'External Image'
          });
          resolve(true);
        };
        
        img.onerror = () => {
          setError('Geçersiz görsel URL\'si veya görsel yüklenemedi');
          setUrlPreview(null);
          reject(false);
        };
        
        img.src = url;
      });
    } catch (error) {
      setError('URL doğrulama hatası');
      setUrlPreview(null);
    }
  }, []);

  // ✅ URL input change
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    setUrlInput(url);
    setError(null);
    
    if (url.trim()) {
      // Debounce URL validation
      clearTimeout(window.urlValidationTimeout);
      window.urlValidationTimeout = setTimeout(() => {
        handleUrlValidation(url);
      }, 1000);
    } else {
      setUrlPreview(null);
    }
  }, [handleUrlValidation]);

  // ✅ KRİTİK: Görsel seçme - EDİTÖRE EKLEME
  const handleImageSelect = useCallback((imageData) => {
    console.log('🖼️ Image selected:', imageData);
    
    if (onImageSelect) {
      // ✅ Parent component'e (editör) görseli gönder
      onImageSelect(imageData.url, altText || imageData.alt || imageData.originalName || 'Görsel');
      console.log('✅ Image sent to editor:', imageData.url);
    }
    
    // Modal'ı kapat
    handleClose();
  }, [onImageSelect, altText]);

  // ✅ URL'den görsel seçme
  const handleUrlSelect = useCallback(() => {
    if (urlPreview && onImageSelect) {
      onImageSelect(urlPreview.url, altText || 'External Image');
      handleClose();
    }
  }, [urlPreview, onImageSelect, altText]);

  // ✅ Modal kapatma
  const handleClose = useCallback(() => {
    setActiveTab('upload');
    setUrlInput('');
    setUrlPreview(null);
    setError(null);
    setSuccess(null);
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedImage(null);
    setAltText('');
    setSearchTerm('');
    setDragActive(false);
    onClose();
  }, [onClose]);

  // ✅ Filtered images for search
  const filteredImages = uploadedImages.filter(image => 
    image.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Görsel Seç</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}
          
          {/* TABS */}
          <div className="flex mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Yükle
            </button>
            
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'url'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              URL
            </button>
            
            <button
              onClick={() => {
                setActiveTab('gallery');
                loadUploadedImages();
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Galeri ({uploadedImages.length})
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {/* DROP ZONE */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                  ${dragActive 
                    ? 'border-blue-400 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }
                  ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
                `}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-700">Yükleniyor...</p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {dragActive ? 'Dosyaları buraya bırakın' : 'Görsel yükleyin'}
                      </p>
                      <p className="text-gray-500 mb-4">
                        Dosyaları sürükleyip bırakın veya seçmek için tıklayın
                      </p>
                      <p className="text-sm text-gray-400">
                        Desteklenen formatlar: JPG, PNG, GIF, WebP • Maks. {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL TAB */}
          {activeTab === 'url' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Görsel URL&apos;si
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* URL PREVIEW */}
              {urlPreview && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <img
                      src={urlPreview.url}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">Görsel Önizleme</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {urlPreview.width} × {urlPreview.height} piksel
                      </p>
                      <button
                        onClick={handleUrlSelect}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Bu Görseli Seç
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              
              {/* SEARCH */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Görsellerde ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Yükle
                </button>
              </div>

              {/* GALLERY GRID */}
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id || image.url}
                      className={`
                        relative bg-white border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg group
                        ${selectedImage?.id === image.id || selectedImage?.url === image.url 
                          ? 'ring-2 ring-blue-500 ring-offset-2' 
                          : 'hover:border-blue-300'
                        }
                      `}
                      onClick={() => setSelectedImage(image)}
                    >
                      
                      {/* IMAGE */}
                      <div className="aspect-square relative">
                        <img
                          src={image.url}
                          alt={image.originalName || 'Görsel'}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageSelect(image);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform scale-95 group-hover:scale-100"
                          >
                            Seç
                          </button>
                        </div>

                        {/* SELECTED INDICATOR */}
                        {(selectedImage?.id === image.id || selectedImage?.url === image.url) && (
                          <div className="absolute top-2 right-2 p-1 bg-blue-500 text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      {/* INFO */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.originalName || 'Görsel'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {image.size ? `${(image.size / 1024).toFixed(1)} KB` : 'Bilinmeyen boyut'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Görsel bulunamadı</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Arama kriterlerinize uygun görsel yok.' : 'Henüz hiç görsel yüklenmemiş.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    İlk Görseli Yükle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            
            <div className="text-sm text-gray-600">
              {activeTab === 'upload' && (
                <span>JPG, PNG, GIF, WebP • Maks. {(maxFileSize / (1024 * 1024)).toFixed(1)}MB</span>
              )}
              {activeTab === 'gallery' && (
                <span>{filteredImages.length} görsel gösteriliyor</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              
              {/* ALT TEXT INPUT */}
              {(selectedImage || urlPreview) && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 whitespace-nowrap">Alt Text:</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Görsel açıklaması..."
                    className="px-3 py-1 border border-gray-300 rounded text-sm w-48"
                  />
                </div>
              )}
              
              {/* SELECT BUTTON */}
              {selectedImage && activeTab === 'gallery' && (
                <button
                  onClick={() => handleImageSelect(selectedImage)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Seç
                </button>
              )}
              
              {/* CANCEL BUTTON */}
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;