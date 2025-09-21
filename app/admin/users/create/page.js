// app/admin/users/create/page.js - Yeni Kullanıcı Oluşturma Sayfası
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Users,
  UserPlus,
  Check,
  X
} from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderator',
    isActive: true,
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Mevcut modülleri fetch et
  useEffect(() => {
    fetchAvailableModules();
  }, []);

  const fetchAvailableModules = async () => {
    try {
      const response = await fetch('/api/admin/permissions/modules?active=true', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.modules || []);
      }
    } catch (error) {
      console.error('Modules fetch error:', error);
    }
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'İsim gereklidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
          permissions: formData.permissions
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Kullanıcı başarıyla oluşturuldu');
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Bir hata oluştu' });
        }
      }
    } catch (error) {
      console.error('Create user error:', error);
      setErrors({ general: 'Sunucu hatası oluştu' });
    } finally {
      setLoading(false);
    }
  };

  // Input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Error'u temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Modül yetkisi toggle
  const handlePermissionToggle = (moduleKey, action) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const moduleIndex = permissions.findIndex(p => p.module === moduleKey);
      
      if (moduleIndex === -1) {
        // Modül yok, yeni oluştur
        permissions.push({
          module: moduleKey,
          actions: [action]
        });
      } else {
        // Modül var, action'ı toggle et
        const modulePermission = permissions[moduleIndex];
        if (modulePermission.actions.includes(action)) {
          modulePermission.actions = modulePermission.actions.filter(a => a !== action);
          if (modulePermission.actions.length === 0) {
            permissions.splice(moduleIndex, 1);
          }
        } else {
          modulePermission.actions.push(action);
        }
      }
      
      return { ...prev, permissions };
    });
  };

  // Rol değiştiğinde otomatik yetkileri uygula
  useEffect(() => {
    if (formData.role && availableModules.length > 0) {
      const defaultPermissions = [];
      
      availableModules.forEach(module => {
        const roleDefault = module.defaultPermissions?.find(dp => dp.role === formData.role);
        if (roleDefault && roleDefault.actions.length > 0) {
          defaultPermissions.push({
            module: module.key,
            actions: [...roleDefault.actions]
          });
        }
      });
      
      setFormData(prev => ({ ...prev, permissions: defaultPermissions }));
    }
  }, [formData.role, availableModules]);

  // Yetki durumu kontrolü
  const hasPermission = (moduleKey, action) => {
    const modulePermission = formData.permissions.find(p => p.module === moduleKey);
    return modulePermission?.actions.includes(action) || false;
  };

  // Rol badge renkleri
  const getRoleBadge = (role) => {
    const badges = {
      'super-admin': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Super Admin' },
      'admin': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Admin' },
      'editor': { bg: 'bg-green-100', text: 'text-green-800', label: 'Editor' },
      'moderator': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Moderator' }
    };
    return badges[role] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role };
  };

  // Action renkleri
  const getActionColor = (action) => {
    const colors = {
      'create': 'bg-green-100 text-green-800',
      'read': 'bg-blue-100 text-blue-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'export': 'bg-purple-100 text-purple-800',
      'import': 'bg-indigo-100 text-indigo-800',
      'approve': 'bg-emerald-100 text-emerald-800',
      'publish': 'bg-pink-100 text-pink-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
      <div className="p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/admin/users"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Yeni Kullanıcı</h1>
                <p className="text-gray-600">Sisteme yeni kullanıcı ekleyin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Temel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* İsim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İsim *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Kullanıcının tam adı"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="kullanici@ornek.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="En az 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Şifre Doğrulama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Doğrulama *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Şifrenizi tekrar giriniz"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {confirmPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rol ve Durum */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Rol ve Durum
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Rolü
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
                >
                  <option value="moderator">Moderator</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
                
                {/* Seçili rol badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getRoleBadge(formData.role).bg} ${getRoleBadge(formData.role).text}`}>
                    {getRoleBadge(formData.role).label}
                  </span>
                </div>
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hesap Durumu
                </label>
                <div className="flex items-center space-x-3 mt-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        formData.isActive ? 'transform translate-x-5' : ''
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Yetki Yönetimi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Yetki Yönetimi
            </h2>
            
            <div className="space-y-6">
              {availableModules.map((module) => (
                <div key={module.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      module.category === 'core' ? 'bg-blue-100 text-blue-800' :
                      module.category === 'content' ? 'bg-green-100 text-green-800' :
                      module.category === 'users' ? 'bg-purple-100 text-purple-800' :
                      module.category === 'settings' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {module.category}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {module.availableActions.map((action) => (
                      <label
                        key={action.key}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={hasPermission(module.key, action.key)}
                            onChange={() => handlePermissionToggle(module.key, action.key)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            hasPermission(module.key, action.key)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {hasPermission(module.key, action.key) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${getActionColor(action.key)}`}>
                          {action.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/users"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              İptal
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Kullanıcı Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
  );
}