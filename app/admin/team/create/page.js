// app/admin/team/create/page.js - Yeni Ekip Üyesi Ekleme Sayfası
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateTeamMember() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
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
  });

  // Position seçenekleri
  const positionOptions = [
    { value: 'founding-partner', label: 'Kurucu Ortak & Avukat' },
    { value: 'managing-partner', label: 'Ortak & Avukat' },
    { value: 'lawyer', label: 'Avukat' },
    { value: 'trainee-lawyer', label: 'Stajyer Avukat' },
    { value: 'legal-assistant', label: 'Hukuk Asistanı' }
  ];

  // Uzmanlık alanları
  const specializationOptions = [
    "Aile Hukuku", "İş Hukuku", "İdare Hukuku", "Ceza Hukuku", "İnfaz Hukuku", 
    "KVKK Hukuku", "Sigorta Hukuku", "İcra Hukuku", "Boşanma Davaları", 
    "Tazminat Davaları", "Alacak Davaları", "Tapu İptali ve Tescil Davaları",
    "İtirazın İptali Davaları", "Kamulaştırma Davaları", "İşçilik Davaları",
    "Menfi Tespit Davaları", "Ortaklığın Giderilmesi Davaları", "Gayrimenkul Hukuku",
    "Miras Hukuku", "Ticaret Hukuku", "Tüketici Hukuku", "Anayasa Mahkemesi Başvuruları",
    "AİHM Bireysel Başvuru", "Özel Hukuk", "Kadın Hakları", "Velayet Davaları"
  ];

  // Slug otomatik oluşturma
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'name') {
      // İsim değiştiğinde slug'ı otomatik oluştur
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Eğitim ekleme/çıkarma
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', description: '' }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Uzmanlık alanı ekleme/çıkarma
  const toggleSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  // Sertifika ekleme/çıkarma
  const addCertificate = () => {
    const certificate = prompt('Sertifika adını girin:');
    if (certificate && certificate.trim()) {
      setFormData(prev => ({
        ...prev,
        certificates: [...prev.certificates, certificate.trim()]
      }));
    }
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  // Dil ekleme/çıkarma
  const addLanguage = () => {
    const language = prompt('Dil adını girin:');
    if (language && language.trim() && !formData.languages.includes(language.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language.trim()]
      }));
    }
  };

  const removeLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/team');
      } else {
        setError(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/team"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Ekip Üyesi Ekle</h1>
            <p className="text-gray-600">Ekip üyesi bilgilerini doldurun</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* İsim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İsim Soyisim *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Av. Ahmet Yılmaz"
              />
            </div>

            {/* Ünvan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ünvan *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Avukat"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="ahmet-yilmaz"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /ekibimiz/{formData.slug}
              </p>
            </div>

            {/* Pozisyon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pozisyon *
              </label>
              <select
                name="position"
                required
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {positionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Resim URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profil Resmi URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="/images/team/ahmet-yilmaz.jpg"
              />
            </div>

            {/* Sıralama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıralama
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biyografi
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Kısa biyografi..."
            />
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700">Aktif</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="featuredOnHomepage"
                checked={formData.featuredOnHomepage}
                onChange={handleInputChange}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ana sayfada göster</span>
            </label>
          </div>
        </div>

        {/* Kişisel Bilgiler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Kişisel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doğum Yılı
              </label>
              <input
                type="number"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="1990"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doğum Yeri
              </label>
              <input
                type="text"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="İstanbul"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baro
              </label>
              <input
                type="text"
                name="barAssociation"
                value={formData.barAssociation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Karabük Barosu"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yüksek Lisans Tezi
              </label>
              <input
                type="text"
                name="masterThesis"
                value={formData.masterThesis}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Tez konusu..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Özel Odaklanma Alanı
              </label>
              <input
                type="text"
                name="specialFocus"
                value={formData.specialFocus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Özel uzmanlık alanı..."
              />
            </div>

            {/* Stajyer için staj yeri */}
            {formData.position === 'trainee-lawyer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staj Yeri
                </label>
                <input
                  type="text"
                  name="internshipLocation"
                  value={formData.internshipLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Staj yapılan büro..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Uzmanlık Alanları */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Uzmanlık Alanları</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {specializationOptions.map((spec) => (
              <label
                key={spec}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  formData.specializations.includes(spec)
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.specializations.includes(spec)}
                  onChange={() => toggleSpecialization(spec)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-2 text-sm font-medium">{spec}</span>
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Seçilen: {formData.specializations.length} alan
          </p>
        </div>

        {/* Eğitim Bilgileri */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Eğitim Bilgileri</h2>
            <button
              type="button"
              onClick={addEducation}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Eğitim Ekle</span>
            </button>
          </div>

          <div className="space-y-6">
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Eğitim #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Derece
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Lisans, Yüksek Lisans, vb."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kurum
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Üniversite/Kurum adı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yıl
                    </label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="2020-2024"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    rows={2}
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ek bilgiler..."
                  />
                </div>
              </div>
            ))}

            {formData.education.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz eğitim bilgisi eklenmemiş</p>
              </div>
            )}
          </div>
        </div>

        {/* Sertifikalar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sertifikalar</h2>
            <button
              type="button"
              onClick={addCertificate}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Sertifika Ekle</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.certificates.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-800">{cert}</span>
                <button
                  type="button"
                  onClick={() => removeCertificate(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {formData.certificates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz sertifika eklenmemiş</p>
              </div>
            )}
          </div>
        </div>

        {/* Diller */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Diller</h2>
            <button
              type="button"
              onClick={addLanguage}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Dil Ekle</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium">{lang}</span>
                {formData.languages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Bilgileri */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="SEO için başlık..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                rows={3}
                value={formData.seoDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="SEO için açıklama..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/team"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            İptal
          </Link>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}