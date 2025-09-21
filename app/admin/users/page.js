// app/admin/users/page.js - Kullanıcı Yönetimi Ana Sayfası
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Kullanıcıları fetch et
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(filterRole && { role: filterRole }),
        ...(filterActive && { active: filterActive })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        console.error('Users fetch failed:', response.status);
      }
    } catch (error) {
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, filterActive]);

  // Kullanıcı aktiflik toggle
  const handleToggleActive = async (userId, isActive) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        console.error('Toggle active failed:', response.status);
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
        setSelectedUsers(prev => prev.filter(id => id !== userId));
      } else {
        console.error('Delete failed:', response.status);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
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

  // Rol iconları
  const getRoleIcon = (role) => {
    switch (role) {
      case 'super-admin': return <ShieldCheck className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'editor': return <Edit className="w-4 h-4" />;
      case 'moderator': return <Eye className="w-4 h-4" />;
      default: return <ShieldX className="w-4 h-4" />;
    }
  };

  // İstatistikler
  const stats = {
    totalUsers: pagination.total || 0,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    adminUsers: users.filter(u => ['super-admin', 'admin'].includes(u.role)).length
  };

  return (
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Kullanıcı Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Sistem kullanıcılarını yönetin, yetkileri düzenleyin
              </p>
            </div>
            
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Yeni Kullanıcı
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Toplam Kullanıcı', 
              value: stats.totalUsers, 
              icon: Users, 
              color: 'blue' 
            },
            { 
              label: 'Aktif Kullanıcılar', 
              value: stats.activeUsers, 
              icon: UserCheck, 
              color: 'green' 
            },
            { 
              label: 'Pasif Kullanıcılar', 
              value: stats.inactiveUsers, 
              icon: UserX, 
              color: 'red' 
            },
            { 
              label: 'Admin Sayısı', 
              value: stats.adminUsers, 
              icon: Shield, 
              color: 'purple' 
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İsim veya email ara..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
            >
              <option value="">Tüm Roller</option>
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="moderator">Moderator</option>
            </select>

            {/* Active Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
            >
              <option value="">Tüm Durumlar</option>
              <option value="true">Aktif</option>
              <option value="false">Pasif</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterActive('');
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 text-black"
            >
              <Filter className="w-4 h-4" />
              Temizle
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Grid */}
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {dropdownOpen === user._id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                        <Link
                          href={`/admin/users/${user._id}/edit`}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setDropdownOpen(null)}
                        >
                          <Edit className="w-4 h-4" />
                          Düzenle
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleToggleActive(user._id, user.isActive);
                            setDropdownOpen(null);
                          }}
                          disabled={actionLoading[user._id]}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-4 h-4" />
                              Pasifleştir
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Aktifleştir
                            </>
                          )}
                        </button>
                        
                        {user.role !== 'super-admin' && (
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                              setDropdownOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getRoleBadge(user.role).bg} ${getRoleBadge(user.role).text}`}>
                    {getRoleIcon(user.role)}
                    {getRoleBadge(user.role).label}
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                </div>

                {/* Permissions Summary */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">Yetkiler:</div>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions?.slice(0, 3).map((permission, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                      >
                        {permission.module}
                      </span>
                    ))}
                    {user.permissions?.length > 3 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                        +{user.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Oluşturulma: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Son Giriş: {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Kullanıcı Bulunamadı</h3>
            <p className="text-gray-600 mb-8">Filtrelere uygun kullanıcı bulunmuyor.</p>
            <Link
              href="/admin/users/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              İlk Kullanıcıyı Oluştur
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {pagination.total} kullanıcının {((currentPage - 1) * pagination.limit) + 1}-{Math.min(currentPage * pagination.limit, pagination.total)} arası gösteriliyor
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Önceki
              </button>
              
              {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                const pageNum = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                if (pageNum > pagination.pages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 flex items-center gap-1"
              >
                Sonraki
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Kullanıcıyı Sil
              </h3>
              <p className="text-gray-600 text-center mb-6">
                <strong>{userToDelete.name}</strong> adlı kullanıcıyı silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete._id)}
                  disabled={actionLoading[userToDelete._id]}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                >
                  {actionLoading[userToDelete._id] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Sil'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}