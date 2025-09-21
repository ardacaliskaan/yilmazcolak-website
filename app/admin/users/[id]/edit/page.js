// app/admin/users/[id]/edit/page.js - Kullanıcı Düzenleme Sayfası
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
  Edit3,
  Check,
  X,
  Calendar,
  Clock,
  Trash2
} from 'lucide-react';

export default function EditUserPage({ params }) {
  const router = useRouter();
  const userId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderator',
    isActive: true,
    permissions: []
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Kullanıcı verilerini fetch et
  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchAvailableModules();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
          permissions: data.user.permissions || [],
          password: '',
          confirmPassword: ''
        };
        
        setFormData(userData);
        setOriginalData(userData);
        setCurrentUser(data.user);
      } else if (response.status === 404) {
        router.push('/admin/users');
      } else {
        setErrors({ general: 'Kullanıcı bilgileri yüklenemedi' });
      }
    } catch (error) {
      console.error('User fetch error:', error);
      setErrors({ general: 'Sunucu hatası oluştu' });
    } finally {
      setLoading(false);
    }
  };

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

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'Yeni şifre gereklidir';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
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

    setSaving(true);
    setErrors({});

    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        isActive: formData.isActive,
        permissions: formData.permissions
      };

      // Şifre değiştirilecekse ekle
      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Kullanıcı başarıyla güncellendi');
        setChangePassword(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
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
      console.error('Update user error:', error);
      setErrors({ general: 'Sunucu hatası oluştu' });
    } finally {
      setSaving(false);
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccessMessage('Kullanıcı başarıyla silindi');
        setTimeout(() => {
          router.push('/admin/users');
        }, 1000);
      } else {
        const data = await response.json();
        setErrors({ general: data.message || 'Silme işlemi başarısız' });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setErrors({ general: 'Sunucu hatası oluştu' });
    }
    setShowDeleteModal(false);
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
        permissions.push({
          module: moduleKey,
          actions: [action]
        });
      } else {
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

  // Yetki durumu kontrolü
  const hasPermission = (moduleKey, action) => {
    const modulePermission = formData.permissions.find(p => p.module === moduleKey);
    return modulePermission?.actions.includes(action) || false;
  };

  // Değişiklik kontrolü
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData) || changePassword;
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

  if (loading) {
    return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/users"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {currentUser?.name} Düzenle
                  </h1>
                  <p className="text-gray-600">Kullanıcı bilgilerini güncelleyin</p>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            {currentUser?.role !== 'super-admin' && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Kullanıcıyı Sil
              </button>
            )}
          </div>

          {/* User Info Card */}
          {currentUser && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{currentUser.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Oluşturulma: {new Date(currentUser.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      {currentUser.lastLogin && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Son Giriş: {new Date(currentUser.lastLogin).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getRoleBadge(currentUser.role).bg} ${getRoleBadge(currentUser.role).text}`}>
                    {getRoleBadge(currentUser.role).label}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full mt-2 ${
                    currentUser.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentUser.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            </div>
          </div>

          {/* Şifre Değiştirme */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Şifre Değiştirme
              </h2>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                      setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
                    }
                  }}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  changePassword ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    changePassword ? 'transform translate-x-5' : ''
                  }`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Şifreyi değiştir
                </span>
              </label>
            </div>
            
            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Yeni Şifre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre *
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
            )}
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
                  disabled={currentUser?.role === 'super-admin'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                >
                  <option value="moderator">Moderator</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
                
                {currentUser?.role === 'super-admin' && (
                  <p className="mt-1 text-sm text-amber-600">
                    Super Admin rolü değiştirilemez
                  </p>
                )}
                
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
                      disabled={currentUser?.role === 'super-admin'}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                    } ${currentUser?.role === 'super-admin' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        formData.isActive ? 'transform translate-x-5' : ''
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </label>
                </div>
                {currentUser?.role === 'super-admin' && (
                  <p className="mt-1 text-sm text-amber-600">
                    Super Admin hesabı devre dışı bırakılamaz
                  </p>
                )}
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
              disabled={saving || !hasChanges()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && currentUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Kullanıcıyı Sil
              </h3>
              <p className="text-gray-600 text-center mb-6">
                <strong>{currentUser.name}</strong> adlı kullanıcıyı silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz ve tüm veriler kaybolacaktır.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}