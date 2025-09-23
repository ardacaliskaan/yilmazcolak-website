// app/admin/team/create/page.js - Professional Team Member Create Page
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Globe,
  UserPlus,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

// Constants
const POSITION_OPTIONS = [
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

const POPULAR_SPECIALIZATIONS = [
  "Aile Hukuku", "Ceza Hukuku", "İş Hukuku", "İdare Hukuku", 
  "Miras Hukuku", "Ticaret Hukuku"
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

  if (formData.name.length > 100) errors.name = 'İsim 100 karakterden uzun olamaz';
  if (formData.title.length > 100) errors.title = 'Ünvan 100 karakterden uzun olamaz';
  if (formData.bio && formData.bio.length > 1000) errors.bio = 'Biyografi 1000 karakterden uzun olamaz';
  
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

const generateSEOFromData = (formData) => {
  if (!formData.name || !formData.title) return {};
  
  const seoTitle = `${formData.name} - ${formData.title} | Yılmaz Çolak Hukuk Bürosu`;
  const seoDescription = `${formData.name}, ${formData.title} olarak ${
    formData.specializations.slice(0, 3).join(', ')
  } alanlarında profesyonel hukuki hizmet vermektedir.`;
  
  return { seoTitle, seoDescription };
};

export default function CreateTeamMember() {
  const router = useRouter();
  
  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

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

  const isFormValid = useMemo(() => {
    const formErrors = validateForm(formData);
    return Object.keys(formErrors).length === 0 && 
           formData.name.trim() && 
           formData.title.trim() && 
           formData.slug.trim();
  }, [formData]);

  const formCompletionPercentage = useMemo(() => {
    const fields = [
      formData.name, formData.title, formData.slug, formData.position,
      formData.bio, formData.birthYear, formData.birthPlace,
      formData.specializations.length > 0,
      formData.education.length > 0,
      formData.languages.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData]);

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
        
        // Auto-generate SEO if not manually set
        const autoSEO = generateSEOFromData({ ...newData, name: value });
        if (!prev.seoTitle) newData.seoTitle = autoSEO.seoTitle;
        if (!prev.seoDescription) newData.seoDescription = autoSEO.seoDescription;
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

  const addPopularSpecializations = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      specializations: [...new Set([...prev.specializations, ...POPULAR_SPECIALIZATIONS])]
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

  // Quick fill helper
  const quickFillDemo = useCallback(() => {
    const demoData = {
      name: 'Av. Örnek Kullanıcı',
      title: 'Avukat',
      slug: 'ornek-kullanici',
      bio: 'Deneyimli avukat olarak müvekkillerimize en iyi hukuki hizmeti sunmaktayım.',
      birthYear: 1985,
      birthPlace: 'İstanbul',
      specializations: ['Aile Hukuku', 'Ceza Hukuku', 'İş Hukuku'],
      languages: ['Türkçe', 'İngilizce'],
      position: 'lawyer'
    };
    
    setFormData(prev => ({ ...prev, ...demoData }));
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setCurrentStep(1); // Go back to first step if validation fails
      return;
    }
    
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      setSuccess('Yeni ekip üyesi başarıyla eklendi!');
      
      // Redirect after 2 seconds or allow user to add another
      setTimeout(() => {
        if (window.confirm('Başka bir ekip üyesi eklemek ister misiniz?')) {
          setFormData(INITIAL_FORM_STATE);
          setCurrentStep(1);
          setSuccess('');
        } else {
          router.push('/admin/team');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Create error:', error);
      setErrors({ 
        general: error.message || 'Ekleme sırasında bir hata oluştu' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  const steps = [
    { id: 1, name: 'Temel Bilgiler', icon: UserPlus },
    { id: 2, name: 'Detay Bilgiler', icon: Calendar },
    { id: 3, name: 'Uzmanlık & SEO', icon: Sparkles }
  ];

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
              <span className="text-gray-900 font-medium">Yeni Üye</span>
            </nav>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni Ekip Üyesi Ekle</h1>
                <p className="text-gray-600">Büronuza yeni bir üye ekleyin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress indicator */}
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border">
                <div className="text-sm font-medium text-gray-700">Tamamlanma:</div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                      style={{ width: `${formCompletionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formCompletionPercentage}%</span>
                </div>
              </div>

              {/* Quick fill demo */}
              <button
                type="button"
                onClick={quickFillDemo}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Demo Doldur
              </button>
            </div>
          </div>

          {/* Step indicator */}
          <div className="mt-6">
            <nav className="flex items-center justify-center space-x-8">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const Icon = step.icon;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-100 text-green-800'
                        : isCompleted
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.name}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
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
              <h3 className="text-sm font-semibold text-green-800">Başarılı!</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
                  <p className="text-sm text-gray-600 mt-1">Ekip üyesinin temel bilgilerini girin</p>
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
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black ${
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
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black ${
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
                          required
                          value={formData.slug}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black ${
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
                        required
                        value={formData.position}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black ${
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

                    {/* Image URL */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profil Resmi URL
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          name="image"
                          value={formData.image || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
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
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kısa Biyografi
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black ${
                        errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Kısa biyografi yazın..."
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Karakter sayısı: {(formData.bio || '').length}/1000
                      </p>
                      {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                    </div>
                  </div>

                  {/* Status toggles */}
                  <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-gray-200">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <div className="select-none">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
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
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <div className="select-none">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
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

              {/* Next Step Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.name || !formData.title || !formData.slug}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.name && formData.title && formData.slug
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Devam Et
                </button>
              </div>
            </>
          )}

          {/* Step 2: Detailed Information */}
          {currentStep === 2 && (
            <>
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Kişisel ve Mesleki Bilgiler</h2>
                  <p className="text-sm text-gray-600 mt-1">Detaylı bilgileri ekleyin</p>
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
                          className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black ${
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                        placeholder="Karabük Barosu"
                      />
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-gray-500">Küçük sayılar önce gösterilir</p>
                    </div>

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                        placeholder="Özel uzmanlık alanı..."
                      />
                    </div>

                    {/* Internship Location (for trainees) */}
                    {isTraineeLawyer && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Staj Yeri
                        </label>
                        <input
                          type="text"
                          name="internshipLocation"
                          value={formData.internshipLocation || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                          placeholder="Staj yapılan büro..."
                        />
                      </div>
                    )}
                  </div>
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
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium text-black"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
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
                        <p className="text-gray-500 mb-4">Henüz eğitim bilgisi eklenmemiş</p>
                        <button
                          type="button"
                          onClick={addEducation}
                          className="inline-flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-700 font-medium text-black"
                        >
                          <Plus className="w-4 h-4" />
                          <span>İlk eğitimi ekle</span>
                        </button>
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
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Dil Ekle</span>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {formData.languages.map((lang, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-green-100 text-green-900 px-4 py-2 rounded-xl group">
                        <span className="text-sm font-semibold">{lang}</span>
                        {formData.languages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLanguage(index)}
                            className="opacity-0 group-hover:opacity-100 text-green-700 hover:text-green-900 transition-all duration-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  Devam Et
                </button>
              </div>
            </>
          )}

          {/* Step 3: Specializations & SEO */}
          {currentStep === 3 && (
            <>
              {/* Specializations */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Uzmanlık Alanları</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Seçilen: {totalSpecializations} alan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPopularSpecializations}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Popüler Alanları Ekle
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SPECIALIZATION_OPTIONS.map((spec) => {
                      const isSelected = formData.specializations.includes(spec);
                      const isPopular = POPULAR_SPECIALIZATIONS.includes(spec);
                      return (
                        <label
                          key={spec}
                          className={`relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm text-black ${
                            isSelected
                              ? 'bg-green-50 border-green-300 text-green-900 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSpecialization(spec)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mr-3 text-black"
                          />
                          <span className="text-sm font-medium select-none">{spec}</span>
                          {isPopular && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-black">
                              <Sparkles className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  
                  {totalSpecializations === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Henüz uzmanlık alanı seçilmemiş</p>
                      <button
                        type="button"
                        onClick={addPopularSpecializations}
                        className="inline-flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-700 font-medium text-black"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Popüler alanları ekle</span>
                      </button>
                    </div>
                  )}
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
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
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

              {/* SEO Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">SEO Ayarları</h2>
                  <p className="text-sm text-gray-600 mt-1">Arama motoru optimizasyonu (otomatik dolduruldu)</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                      placeholder="Otomatik oluşturulacak..."
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                      placeholder="Otomatik oluşturulacak..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Karakter sayısı: {(formData.seoDescription || '').length}/160
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Form Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      <span>Geri</span>
                    </button>
                    
                    <Link
                      href="/admin/team"
                      className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      İptal Et
                    </Link>

                    {formData.slug && (
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Önizleme</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className={`inline-flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : isFormValid
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Ekip Üyesini Ekle</span>
                      </>
                    )}
                  </button>
                </div>
                
                {!isFormValid && (
                  <p className="text-xs text-red-500 mt-2 text-right">
                    Zorunlu alanları doldurun
                  </p>
                )}
              </div>

              {/* Preview Section */}
              {showPreview && formData.name && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h3>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900">{formData.name}</h4>
                        <p className="text-amber-600 font-medium">{formData.title}</p>
                        {selectedPosition && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${selectedPosition.color}`}>
                            {selectedPosition.label}
                          </span>
                        )}
                        {formData.bio && (
                          <p className="text-gray-600 mt-3 text-sm">{formData.bio}</p>
                        )}
                        {totalSpecializations > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Uzmanlık Alanları:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.specializations.slice(0, 5).map((spec, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {spec}
                                </span>
                              ))}
                              {totalSpecializations > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{totalSpecializations - 5} daha
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}