'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  Download
} from 'lucide-react';

const ImageUploadModal = ({ 
  isOpen, 
  onClose, 
  onImageSelect,
  uploadEndpoint = '/api/admin/upload',
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Validate file
  const validateFile = useCallback((file) => {
    if (!acceptedFormats.includes(file.type)) {
      throw new Error(`Desteklenmeyen dosya formatı. Desteklenenler: ${acceptedFormats.join(', ')}`);
    }
    
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      throw new Error(`Dosya boyutu çok büyük. Maksimum: ${maxSizeMB}MB`);
    }
    
    return true;
  }, [acceptedFormats, maxFileSize]);

  // Upload file to server
  const uploadFile = useCallback(async (file) => {
    try {
      validateFile(file);
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'article');

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              const newImage = {
                id: Date.now(),
                url: response.url,
                filename: response.filename,
                originalName: response.originalName || file.name,
                size: response.size || file.size,
                uploadedAt: new Date().toISOString()
              };
              
              setUploadedImages(prev => [...prev, newImage]);
              resolve(response);
            } else {
              reject(new Error(response.message || 'Upload başarısız'));
            }
          } else {
            reject(new Error(`Server hatası: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network hatası'));
        });

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
    
    for (const file of fileList) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error('Upload error:', error);
        // Error is already set in uploadFile
      }
    }
  }, [uploadFile]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Handle drag events
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

  // Validate URL
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
      // Debounce URL validation
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
      onImageSelect(imageData.url, imageData.originalName || '');
    }
    onClose();
  }, [onImageSelect, onClose]);

  // Select URL image
  const handleUrlSelect = useCallback(() => {
    if (urlPreview && onImageSelect) {
      onImageSelect(urlPreview.url, 'Harici görsel');
    }
    onClose();
  }, [urlPreview, onImageSelect, onClose]);

  // Close modal
  const handleClose = useCallback(() => {
    setActiveTab('upload');
    setUploadedImages([]);
    setUrlInput('');
    setUrlPreview(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    onClose();
  }, [onClose]);

  // Copy URL to clipboard
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could show a toast here
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Görsel Yöneticisi</h3>
              <p className="text-sm text-gray-600">Görsel yükleyin veya URL ekleyin</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Dosya Yükle
            </button>
            <button 
              onClick={() => setActiveTab('url')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'url' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              URL Ekle
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'gallery' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Galeri ({uploadedImages.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
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
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    dragActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {dragActive ? 'Dosyaları buraya bırakın' : 'Görsel dosyalarını yükleyin'}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Dosya seçmek için tıklayın veya sürükleyip bırakın
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span>Maks: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB</span>
                      <span>•</span>
                      <span>Format: JPG, PNG, GIF, WebP</span>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats.join(',')}
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="font-medium text-blue-900">Yükleniyor...</span>
                    <span className="text-blue-600 font-mono text-sm ml-auto">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Görsel URL&apos;si
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  {urlPreview && (
                    <button
                      onClick={handleUrlSelect}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Kullan
                    </button>
                  )}
                </div>
              </div>

              {/* URL Preview */}
              {urlPreview && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Önizleme</h4>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Image
                        src={urlPreview.url}
                        alt="URL Preview"
                        width={200}
                        height={150}
                        className="rounded-lg shadow-sm object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm text-gray-600">
                      <p><strong>Boyut:</strong> {urlPreview.width} × {urlPreview.height}px</p>
                      <p><strong>URL:</strong> {urlPreview.url.substring(0, 50)}...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {uploadedImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">Henüz yüklenen görsel yok</p>
<p className="text-sm">İlk görselinizi yüklemek için &quot;Dosya Yükle&quot; sekmesini kullanın</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
                      <div className="aspect-square relative">
                        <Image
                          src={image.url}
                          alt={image.originalName}
                          fill
                          className="object-cover"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleImageSelect(image)}
                            className="p-2 bg-white text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 hover:bg-blue-50 hover:text-blue-600"
                            title="Seç"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => copyToClipboard(image.url)}
                            className="p-2 bg-white text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 hover:bg-green-50 hover:text-green-600"
                            title="URL Kopyala"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-900 truncate">{image.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(image.size / 1024).toFixed(1)} KB • {new Date(image.uploadedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {activeTab === 'upload' && (
                <span>Desteklenen formatlar: JPG, PNG, GIF, WebP</span>
              )}
              {activeTab === 'url' && (
                <span>Geçerli bir görsel URL&apos;si girin</span>
              )}
              {activeTab === 'gallery' && (
                <span>{uploadedImages.length} görsel yüklendi</span>
              )}
            </div>
            
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
  );
};

export default ImageUploadModal;