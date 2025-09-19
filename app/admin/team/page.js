// app/admin/team/page.js - Profesyonel Ekip Yönetimi Ana Sayfası
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  MoreVertical,
  User,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  FileText,
  Users,
  Award,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default function AdminTeamManagement() {
  // State Management
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [sortField, setSortField] = useState('sortOrder');
  const [sortDirection, setSortDirection] = useState('asc');
  const [actionLoading, setActionLoading] = useState({});

  // Position seçenekleri - Edit sayfası ile tutarlı
  const positionOptions = [
    { value: 'founding-partner', label: 'Kurucu Ortak & Avukat', color: 'bg-purple-100 text-purple-800' },
    { value: 'managing-partner', label: 'Ortak & Avukat', color: 'bg-blue-100 text-blue-800' },
    { value: 'lawyer', label: 'Avukat', color: 'bg-green-100 text-green-800' },
    { value: 'trainee-lawyer', label: 'Stajyer Avukat', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'legal-assistant', label: 'Hukuk Asistanı', color: 'bg-gray-100 text-gray-800' }
  ];

  // Utility Functions
  const getPositionLabel = (position) => {
    const pos = positionOptions.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  const getPositionColor = (position) => {
    const pos = positionOptions.find(p => p.value === position);
    return pos ? pos.color : 'bg-gray-100 text-gray-800';
  };

  // Data Fetching
  useEffect(() => {
    const delayedFetch = setTimeout(() => {
      fetchMembers();
    }, 300); // Debounce for search

    return () => clearTimeout(delayedFetch);
  }, [currentPage, searchTerm, filterPosition, filterActive, sortField, sortDirection]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterPosition) params.append('position', filterPosition);
      if (filterActive !== '') params.append('active', filterActive);
      if (sortField) params.append('sort', sortField);
      if (sortDirection) params.append('direction', sortDirection);

      const response = await fetch(`/api/admin/team?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
        setPagination(data.pagination);
      } else {
        console.error('Fetch failed:', response.status);
        setMembers([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterPosition, filterActive, sortField, sortDirection]);

  // Action Handlers
  const handleToggleActive = async (memberId, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [memberId]: true }));
    
    try {
      const response = await fetch(`/api/admin/team/${memberId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchMembers();
      } else {
        console.error('Toggle failed:', response.status);
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleDeleteMember = async (memberId) => {
    setActionLoading(prev => ({ ...prev, [memberId]: true }));
    
    try {
      const response = await fetch(`/api/admin/team/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchMembers();
        setShowDeleteModal(false);
        setMemberToDelete(null);
      } else {
        console.error('Delete failed:', response.status);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterPosition('');
    setFilterActive('');
    setCurrentPage(1);
    setSortField('sortOrder');
    setSortDirection('asc');
  };

  const handleBulkAction = async (action) => {
    if (selectedMembers.length === 0) return;

    try {
      const promises = selectedMembers.map(memberId => {
        switch (action) {
          case 'activate':
            return fetch(`/api/admin/team/${memberId}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: true }),
            });
          case 'deactivate':
            return fetch(`/api/admin/team/${memberId}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: false }),
            });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      await fetchMembers();
      setSelectedMembers([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  // Team Member Card Component
  const TeamMemberCard = ({ member }) => {
    const isLoading = actionLoading[member._id];

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
        {/* Header with Checkbox and Menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedMembers.includes(member._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMembers(prev => [...prev, member._id]);
                } else {
                  setSelectedMembers(prev => prev.filter(id => id !== member._id));
                }
              }}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <User className="w-6 h-6 text-amber-600" />
              )}
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative group/menu">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="absolute right-0 top-10 invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 z-10">
              <Link
                href={`/admin/team/${member._id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
                <span>Düzenle</span>
              </Link>
              
              <button
                onClick={() => handleToggleActive(member._id, member.isActive)}
                disabled={isLoading}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {member.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{member.isActive ? 'Pasif Yap' : 'Aktif Yap'}</span>
              </button>
              
              <hr className="my-1" />
              
              <button
                onClick={() => {
                  setMemberToDelete(member);
                  setShowDeleteModal(true);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Member Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {member.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{member.title}</p>
          </div>

          {/* Position Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPositionColor(member.position)}`}>
              {getPositionLabel(member.position)}
            </span>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              member.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {member.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </div>

          {/* Contact Info */}
          {(member.email || member.phone) && (
            <div className="space-y-1 pt-2 border-t border-gray-100">
              {member.email && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Specializations */}
          {member.specializations && member.specializations.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-1">
                {member.specializations.slice(0, 2).map((spec, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                    {spec}
                  </span>
                ))}
                {member.specializations.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    +{member.specializations.length - 2} daha
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 mt-3 border-t border-gray-100">
          <span className="flex items-center">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Sıra: {member.sortOrder || 0}
          </span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(member.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ekip Yönetimi</h1>
          <p className="text-gray-600">Ekip üyelerini yönetin ve düzenleyin</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Bulk Actions */}
          {selectedMembers.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-sm text-amber-700 font-medium">
                {selectedMembers.length} seçili
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Aktif Yap
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Pasif Yap
              </button>
            </div>
          )}

          <Link
            href="/admin/team/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Üye Ekle
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && pagination && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
                <p className="text-xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Aktif Üye</p>
                <p className="text-xl font-bold text-gray-900">
                  {members.filter(m => m.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avukat</p>
                <p className="text-xl font-bold text-gray-900">
                  {members.filter(m => m.position === 'lawyer' || m.position === 'founding-partner' || m.position === 'managing-partner').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Stajyer</p>
                <p className="text-xl font-bold text-gray-900">
                  {members.filter(m => m.position === 'trainee-lawyer').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="İsim, ünvan veya email ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Position Filter */}
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Tüm Pozisyonlar</option>
            {positionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Active Status Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Temizle
          </button>
        </div>

        {/* Results Info and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-200">
          {pagination && (
            <p className="text-sm text-gray-600">
              {pagination.total} üyeden {((pagination.page - 1) * pagination.limit) + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
            </p>
          )}

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <span className="text-sm text-gray-600">Sırala:</span>
            <button
              onClick={() => handleSort('name')}
              className={`text-sm px-3 py-1 rounded-lg border transition-colors duration-200 ${
                sortField === 'name' 
                  ? 'bg-amber-100 text-amber-700 border-amber-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              İsim {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('sortOrder')}
              className={`text-sm px-3 py-1 rounded-lg border transition-colors duration-200 ${
                sortField === 'sortOrder' 
                  ? 'bg-amber-100 text-amber-700 border-amber-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Sıra {sortField === 'sortOrder' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('createdAt')}
              className={`text-sm px-3 py-1 rounded-lg border transition-colors duration-200 ${
                sortField === 'createdAt' 
                  ? 'bg-amber-100 text-amber-700 border-amber-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tarih {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="flex space-x-2 mt-3">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <TeamMemberCard key={member._id} member={member} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ekip üyesi bulunamadı</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterPosition || filterActive 
              ? 'Arama kriterlerinize uygun sonuç bulunamadı. Filtrelerinizi kontrol edin ve tekrar deneyin.'
              : 'Henüz hiç ekip üyesi eklenmemiş. İlk ekip üyenizi ekleyerek başlayın.'
            }
          </p>
          {!searchTerm && !filterPosition && !filterActive && (
            <Link
              href="/admin/team/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              İlk Üyeyi Ekle
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
          >
            Önceki
          </button>
          
          {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
            let pageNum;
            if (pagination.pages <= 7) {
              pageNum = i + 1;
            } else if (currentPage <= 4) {
              pageNum = i + 1;
            } else if (currentPage >= pagination.pages - 3) {
              pageNum = pagination.pages - 6 + i;
            } else {
              pageNum = currentPage - 3 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-white shadow-md'
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
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && memberToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Üyeyi Sil
            </h3>
            <p className="text-gray-600 text-center mb-6">
              <strong>{memberToDelete.name}</strong> adlı ekip üyesini silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz ve tüm ilgili veriler kalıcı olarak silinecektir.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMemberToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteMember(memberToDelete._id)}
                disabled={actionLoading[memberToDelete._id]}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {actionLoading[memberToDelete._id] ? (
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