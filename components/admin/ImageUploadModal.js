// components/admin/ImageUploadModal.js - Enhanced Version
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { 
  Upload,
  X,
  Image as ImageIcon,
  Link,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Copy,
  Download,
  Grid,
  Search,
  Filter,
  Plus
} from 'lucide-react';

const ImageUploadModal = ({ 
  isOpen, 
  onClose, 
  onImageSelect,
  uploadEndpoint = '/api/admin/upload',
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowMultiple = false
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [altText, setAltText] = useState('');

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Load existing images on mount
  useEffect(() => {
    if (isOpen && activeTab === 'gallery') {
      loadUploadedImages();
    }
  }, [isOpen, activeTab]);

  // Load uploaded images from gallery
  const loadUploadedImages = async () => {
    try {
      const response = await fetch('/api/admin/media', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUploadedImages(data.images || []);
        }
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  // Validate file
  const validateFile = useCallback((file) => {
    if (!acceptedFormats.includes(file.type)) {
      throw new Error(`Desteklenmeyen dosya formatı. Desteklenenler: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`);
    }
    
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      throw new Error(`Dosya boyutu çok büyük. Maksimum: ${maxSizeMB}MB`);
    }

    return true;
  }, [acceptedFormats, maxFileSize]);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file
      validateFile(file);

      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'article-image');

      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200 && response.success) {
              const uploadedImage = {
                id: Date.now(),
                url: response.url,
                originalName: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                alt: ''
              };
              
              setUploadedImages(prev => [uploadedImage, ...prev]);
              resolve(uploadedImage);
            } else {
              throw new Error(response.message || 'Yükleme başarısız');
            }
          } catch (error) {
            reject(new Error('Sunucu yanıtı işlenemedi'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Ağ hatası oluştu'));
        };

        xhr.open('POST', uploadEndpoint);
        xhr.send(formData);
      });

    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [uploadEndpoint, validateFile]);

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    const fileList = Array.from(files);
    
    if (!allowMultiple && fileList.length > 1) {
      setError('Sadece bir dosya seçebilirsiniz');
      return;
    }

    for (const file of fileList) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error('Upload error:', error);
        // Error is already set in uploadFile
        break; // Stop uploading on first error
      }
    }
  }, [uploadFile, allowMultiple]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Drag and drop handlers
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // URL validation
  const handleUrlValidation = useCallback(async (url) => {
    if (!url) return;

    try {
      setError(null);
      const img = new window.Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          setUrlPreview({
            url,
            width: img.naturalWidth,
            height: img.naturalHeight
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

  // Handle URL input
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    setUrlInput(url);
    
    if (url) {
      clearTimeout(window.urlValidationTimeout);
      window.urlValidationTimeout = setTimeout(() => {
        handleUrlValidation(url);
      }, 1000);
    } else {
      setUrlPreview(null);
      setError(null);
    }
  }, [handleUrlValidation]);

  // Select image
  const handleImageSelect = useCallback((imageData) => {
    if (onImageSelect) {
      onImageSelect(imageData.url, altText || imageData.alt || imageData.originalName || '');
    }
    handleClose();
  }, [onImageSelect, altText]);

  // Select URL image
  const handleUrlSelect = useCallback(() => {
    if (urlPreview && onImageSelect) {
      onImageSelect(urlPreview.url, altText || 'Harici görsel');
    }
    handleClose();
  }, [urlPreview, onImageSelect, altText]);

  // Close modal
  const handleClose = useCallback(() => {
    setActiveTab('upload');
    setUploadedImages([]);
    setUrlInput('');
    setUrlPreview(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedImage(null);
    setAltText('');
    setSearchTerm('');
    onClose();
  }, [onClose]);

  // Delete image
  const handleDeleteImage = useCallback(async (imageId) => {
    try {
      const response = await fetch(`/api/admin/media/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }, []);

  // Filter images based on search
  const filteredImages = uploadedImages.filter(image => 
    image.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Görsel Yöneticisi</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
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
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
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
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Galeri
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-colors
                  ${dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={allowMultiple}
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Yükleniyor...</p>
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      Görsel Yükle
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Dosyaları buraya sürükle bırak veya seç
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Dosya Seç
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      Desteklenen formatlar: JPG, PNG, GIF, WebP<br />
                      Maksimum boyut: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Görsel URL'si
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* URL Preview */}
              {urlPreview && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={urlPreview.url}
                      alt="Önizleme"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Görsel Önizlemesi</p>
                      <p className="text-sm text-gray-500">
                        {urlPreview.width} × {urlPreview.height} piksel
                      </p>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder="Görsel açıklaması..."
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={handleUrlSelect}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Bu Görseli Kullan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Görsellerde ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={loadUploadedImages}
                  className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {/* Image Grid */}
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={`
                        relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all
                        ${selectedImage?.id === image.id 
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={image.url}
                          alt={image.alt || image.originalName}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(image);
                                handleImageSelect(image);
                              }}
                              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Selected indicator */}
                        {selectedImage?.id === image.id && (
                          <div className="absolute top-2 right-2 p-1 bg-blue-500 text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(image.size / 1024).toFixed(1)} KB • {new Date(image.uploadedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Görsel bulunamadı</h3>
                  <p className="text-gray-500 mb-4">Henüz hiç görsel yüklenmemiş veya arama kriterlerinize uygun görsel yok.</p>
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

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {activeTab === 'upload' && !isUploading && (
                <span>Desteklenen formatlar: JPG, PNG, GIF, WebP • Maks. {(maxFileSize / (1024 * 1024)).toFixed(1)}MB</span>
              )}
              {activeTab === 'url' && (
                <span>Geçerli bir görsel URL'si girin</span>
              )}
              {activeTab === 'gallery' && (
                <span>{filteredImages.length} görsel gösteriliyor</span>
              )}
            </div>
            
            <div className="flex gap-3">
              {selectedImage && activeTab === 'gallery' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Alt Text:</label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Görsel açıklaması..."
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleImageSelect(selectedImage)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Seç
                  </button>
                </>
              )}
              
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