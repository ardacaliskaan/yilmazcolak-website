// app/admin/team/[id]/edit/page.js - Professional Team Member Edit Page
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Loader, 
  AlertCircle,
  CheckCircle,
  Upload,
  Eye,
  Calendar,
  Globe
} from 'lucide-react';
import Link from 'next/link';

// Constants
const POSITION_OPTIONS = [
  { value: 'founding-partner', label: 'Kurucu Ortak & Avukat', color: 'bg-purple-100 text-purple-800' },
  { value: 'managing-partner', label: 'Ortak & Avukat', color: 'bg-blue-100 text-blue-800' },
  { value: 'lawyer', label: 'Avukat', color: 'bg-green-100 text-green-800' },
  { value: 'trainee-lawyer', label: 'Stajyer Avukat', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'legal-assistant', label: 'Hukuk Asistanı', color: 'bg-gray-100 text-gray-800' }
];

const SPECIALIZATION_OPTIONS = [
  "Aile Hukuku", "İş Hukuku", "İdare Hukuku", "Ceza Hukuku", "İnfaz Hukuku", 
  "KVKK Hukuku", "Sigorta Hukuku", "İcra Hukuku", "Boşanma Davaları", 
  "Tazminat Davaları", "Alacak Davaları", "Tapu İptali ve Tescil Davaları",
  "İtirazın İptali Davaları", "Kamulaştırma Davaları", "İşçilik Davaları",
  "Menfi Tespit Davaları", "Ortaklığın Giderilmesi Davaları", "Gayrimenkul Hukuku",
  "Miras Hukuku", "Ticaret Hukuku", "Tüketici Hukuku", "Anayasa Mahkemesi Başvuruları",
  "AİHM Bireysel Başvuru", "Özel Hukuk", "Kadın Hakları", "Velayet Davaları"
];

const DEGREE_OPTIONS = [
  "Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora", 
  "Post Doktora", "Sertifika Programı", "Kurs"
];

// Initial form state
const INITIAL_FORM_STATE = {
  name: '',
  title: '',
  slug: '',
  image: '',
  position: 'lawyer',
  bio: '',
  birthYear: '',
  birthPlace: '',
  specializations: [],
  education: [],
  certificates: [],
  languages: ['Türkçe'],
  barAssociation: 'Karabük Barosu',
  masterThesis: '',
  specialFocus: '',
  internshipLocation: '',
  isActive: true,
  featuredOnHomepage: false,
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: []
};

// Validation rules
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.name.trim()) errors.name = 'İsim soyisim zorunludur';
  if (!formData.title.trim()) errors.title = 'Ünvan zorunludur';
  if (!formData.slug.trim()) errors.slug = 'URL slug zorunludur';
  if (!formData.position) errors.position = 'Pozisyon seçimi zorunludur';
  
  if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug = 'Slug sadece küçük harf, rakam ve tire içerebilir';
  }
  
  if (formData.birthYear && (formData.birthYear < 1950 || formData.birthYear > new Date().getFullYear())) {
    errors.birthYear = 'Geçerli bir doğum yılı giriniz';
  }
  
  return errors;
};

// Utility functions
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function EditTeamMember() {
  const router = useRouter();
  const params = useParams();
  
  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Memoized values
  const selectedPosition = useMemo(() => 
    POSITION_OPTIONS.find(p => p.value === formData.position),
    [formData.position]
  );

  const isTraineeLawyer = useMemo(() => 
    formData.position === 'trainee-lawyer',
    [formData.position]
  );

  const totalSpecializations = useMemo(() => 
    formData.specializations.length,
    [formData.specializations]
  );

  // Fetch member data
  const fetchMember = useCallback(async () => {
    if (!params.id) return;
    
    setFetchLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`/api/admin/${params.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const memberData = {
        ...INITIAL_FORM_STATE,
        ...data.member,
        birthYear: data.member.birthYear || '',
        sortOrder: data.member.sortOrder || 0,
        specializations: data.member.specializations || [],
        education: data.member.education || [],
        certificates: data.member.certificates || [],
        languages: data.member.languages || ['Türkçe'],
        seoKeywords: data.member.seoKeywords || []
      };
      
      setFormData(memberData);
      setOriginalData(memberData);
      
    } catch (error) {
      console.error('Fetch member error:', error);
      setErrors({ 
        general: error.message || 'Üye bilgileri alınırken bir hata oluştu' 
      });
    } finally {
      setFetchLoading(false);
    }
  }, [params.id]);

  // Check for unsaved changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, originalData]);

  // Fetch data on mount
  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-generate slug when name changes
      if (name === 'name' && value.trim()) {
        const autoSlug = generateSlug(value);
        newData.slug = autoSlug;
      }
      
      return newData;
    });
    
    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message
    if (success) setSuccess('');
  }, [errors, success]);

  // Education management
  const addEducation = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { 
        degree: '', 
        institution: '', 
        year: '', 
        description: '' 
      }]
    }));
  }, []);

  const removeEducation = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  }, []);

  const updateEducation = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  }, []);

  // Specialization management
  const toggleSpecialization = useCallback((spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  }, []);

  // Certificate management
  const addCertificate = useCallback(() => {
    const certificate = window.prompt('Sertifika adını girin:');
    if (certificate?.trim()) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, certificate.trim()]
      }));
    }
  }, []);

  const removeCertificate = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  }, []);

  // Language management
  const addLanguage = useCallback(() => {
    const language = window.prompt('Dil adını girin:');
    if (language?.trim() && !formData.languages.includes(language.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language.trim()]
      }));
    }
  }, [formData.languages]);

  const removeLanguage = useCallback((index) => {
    if (formData.languages.length > 1) {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter((_, i) => i !== index)
      }));
    }
  }, [formData.languages]);

  // Form submission
  // Form submission
// Form submission - TAMAMEN DÜZELTİLMİŞ VERSİYON
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  
  console.log('🔄 Form submit başlatıldı');
  console.log('📝 Form Data:', formData);
  
  // Validate form
  const formErrors = validateForm(formData);
  if (Object.keys(formErrors).length > 0) {
    console.log('❌ Validation errors:', formErrors);
    setErrors(formErrors);
    return;
  }
  
  setLoading(true);
  setErrors({});
  setSuccess('');

  try {
    console.log('📡 API çağrısı başlatılıyor...');
    
    const response = await fetch(`/api/admin/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    console.log('📡 API Response Status:', response.status);
    
    const data = await response.json();
    console.log('📡 API Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Güncelleme başarılı!');
    setSuccess('Ekip üyesi başarıyla güncellendi!');
    setOriginalData(formData); // Original data'yı güncelle
    
    // Focus'ı temizle
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    
    // Redirect after 2 seconds
    setTimeout(() => {
      console.log('🔄 Redirect ediliyor...');
      router.push('/admin/team');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Update error:', error);
    setErrors({ 
      general: error.message || 'Güncelleme sırasında bir hata oluştu' 
    });
  } finally {
    setLoading(false);
    console.log('🏁 Form submit tamamlandı');
  }
}, [formData, params.id, router]);

  // Loading state
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin mx-auto text-amber-600" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Yükleniyor...</h3>
            <p className="text-gray-600">Ekip üyesi bilgileri getiriliyor</p>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Ekip Üyesi Bulunamadı</h2>
            <p className="text-gray-600">
              Aradığınız ekip üyesi mevcut değil, silinmiş olabilir veya bu üyeyi görme yetkiniz bulunmuyor.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin/team"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ekip Listesine Dön</span>
            </Link>
            <button
              onClick={fetchMember}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              <span>Tekrar Dene</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin/team"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Geri Dön</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span>Ekip</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Düzenle</span>
            </nav>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.name || 'Ekip Üyesi Düzenle'}
                </h1>
                <p className="text-gray-600 flex items-center space-x-4">
                  {formData.title && (
                    <>
                      <span>{formData.title}</span>
                      <span>•</span>
                    </>
                  )}
                  {selectedPosition && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPosition.color}`}>
                      {selectedPosition.label}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Kaydedilmemiş değişiklikler var</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Hata Oluştu</h3>
              <p className="text-sm text-red-700 mt-1">{errors.general}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-800">Başarılı</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
<form onSubmit={handleSubmit} noValidate className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
              <p className="text-sm text-gray-600 mt-1">Ekip üyesinin temel bilgilerini düzenleyin</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    İsim Soyisim *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Av. Ahmet Yılmaz"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ünvan *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Avukat"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black ${
                        errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="ahmet-yilmaz"
                    />
                    <div className="absolute right-3 top-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 flex items-center space-x-1">
                    <span>URL:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs text-black">
                      /ekibimiz/{formData.slug || 'slug'}
                    </code>
                  </p>
                  {errors.slug && <p className="mt-1 text-sm text-red-600 text-black">{errors.slug}</p>}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pozisyon *
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black ${
                      errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    {POSITION_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                </div>

        <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Profil Resmi URL
  </label>
  <div className="relative">
    <input
      type="text"  // url yerine text
      name="image"
      value={formData.image || ''}
      onChange={handleInputChange}
      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
      placeholder="/images/team/ahmet-yilmaz.jpg"
    />
    <div className="absolute right-3 top-3">
      <Upload className="w-5 h-5 text-gray-400" />
    </div>
  </div>
  {formData.image && (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-600 mb-2">Önizleme:</p>
      <img 
        src={formData.image} 
        alt="Preview" 
        className="w-16 h-16 rounded-lg object-cover border"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  )}
</div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sıralama
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    min="0"
                    max="999"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Küçük sayılar önce gösterilir</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Biyografi
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="Kısa biyografi yazın..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Karakter sayısı: {(formData.bio || '').length}
                </p>
              </div>

              {/* Status toggles */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-gray-200">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                  />
                  <div className="select-none">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Aktif Durum
                    </span>
                    <p className="text-xs text-gray-500">
                      Üye sitede görünür olsun
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="featuredOnHomepage"
                    checked={formData.featuredOnHomepage}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                  />
                  <div className="select-none">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                      Ana Sayfa
                    </span>
                    <p className="text-xs text-gray-500">
                      Ana sayfada öne çıkarılsın
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
              <p className="text-sm text-gray-600 mt-1">Kişisel ve mesleki detayları</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Birth Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Doğum Yılı
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="birthYear"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.birthYear}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black ${
                        errors.birthYear ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="1990"
                    />
                    <div className="absolute right-3 top-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.birthYear && <p className="mt-1 text-sm text-red-600">{errors.birthYear}</p>}
                </div>

                {/* Birth Place */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Doğum Yeri
                  </label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="İstanbul"
                  />
                </div>

                {/* Bar Association */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Baro
                  </label>
                  <input
                    type="text"
                    name="barAssociation"
                    value={formData.barAssociation || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="Karabük Barosu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Master Thesis */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Yüksek Lisans Tezi
                  </label>
                  <input
                    type="text"
                    name="masterThesis"
                    value={formData.masterThesis || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="Tez konusu..."
                  />
                </div>

                {/* Special Focus */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Özel Odaklanma Alanı
                  </label>
                  <input
                    type="text"
                    name="specialFocus"
                    value={formData.specialFocus || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="Özel uzmanlık alanı..."
                  />
                </div>

                {/* Internship Location (for trainees) */}
                {isTraineeLawyer && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Staj Yeri
                    </label>
                    <input
                      type="text"
                      name="internshipLocation"
                      value={formData.internshipLocation || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                      placeholder="Staj yapılan büro..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Uzmanlık Alanları</h2>
              <p className="text-sm text-gray-600 mt-1">
                Seçilen: {totalSpecializations} alan
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-black">
                {SPECIALIZATION_OPTIONS.map((spec) => {
                  const isSelected = formData.specializations.includes(spec);
                  return (
                    <label
                      key={spec}
                      className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm text-black ${
                        isSelected
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSpecialization(spec)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 mr-3 text-black"
                      />
                      <span className="text-sm font-medium select-none">{spec}</span>
                    </label>
                  );
                })}
              </div>
              
              {totalSpecializations === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Henüz uzmanlık alanı seçilmemiş</p>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Eğitim Bilgileri</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.education.length} eğitim kaydı
                </p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium text-black"
              >
                <Plus className="w-4 h-4" />
                <span>Eğitim Ekle</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {formData.education.map((edu, index) => (
                  <div key={index} className="border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Eğitim #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 text-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Derece
                        </label>
                        <select
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                        >
                          <option value="">Derece seçin</option>
                          {DEGREE_OPTIONS.map(degree => (
                            <option key={degree} value={degree}>{degree}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kurum
                        </label>
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                          placeholder="Üniversite/Kurum adı"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yıl
                        </label>
                        <input
                          type="text"
                          value={edu.year || ''}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                          placeholder="2020-2024"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Açıklama
                      </label>
                      <textarea
                        rows={2}
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                        placeholder="Ek bilgiler..."
                      />
                    </div>
                  </div>
                ))}

                {formData.education.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Henüz eğitim bilgisi eklenmemiş</p>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="mt-4 inline-flex items-center space-x-2 px-4 py-2 text-amber-600 hover:text-amber-700 font-medium text-black"
                    >
                      <Plus className="w-4 h-4" />
                      <span>İlk eğitimi ekle</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sertifikalar</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.certificates.length} sertifika
                </p>
              </div>
              <button
                type="button"
                onClick={addCertificate}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium text-black"
              >
                <Plus className="w-4 h-4" />
                <span>Sertifika Ekle</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {formData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors duration-200">
                    <span className="text-sm font-medium text-gray-800 flex-1 mr-4">{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {formData.certificates.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Henüz sertifika eklenmemiş</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Diller</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.languages.length} dil
                </p>
              </div>
              <button
                type="button"
                onClick={addLanguage}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Dil Ekle</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-amber-100 text-amber-900 px-4 py-2 rounded-xl group">
                    <span className="text-sm font-semibold">{lang}</span>
                    {formData.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="opacity-0 group-hover:opacity-100 text-amber-700 hover:text-amber-900 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">SEO Ayarları</h2>
              <p className="text-sm text-gray-600 mt-1">Arama motoru optimizasyonu için</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SEO Başlık
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="SEO için özelleştirilmiş başlık..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SEO Açıklama
                </label>
                <textarea
                  name="seoDescription"
                  rows={3}
                  value={formData.seoDescription || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="Arama motorları için açıklama..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Karakter sayısı: {(formData.seoDescription || '').length}/160
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/team"
                  className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-black"
                >
                  <span>İptal</span>
                </Link>
                
                {formData.slug && (
                  <a
                    href={`/ekibimiz/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Önizle</span>
                  </a>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !hasUnsavedChanges}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : hasUnsavedChanges
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
            
            {!hasUnsavedChanges && (
              <p className="text-xs text-gray-500 mt-2 text-right">
                Değişiklik yapıldığında kaydet butonu aktif olacak
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}