// app/admin/team/page.js - Ekip Yönetimi Ana Sayfası
'use client';

import { useState, useEffect } from 'react';
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
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function AdminTeamManagement() {
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

  // Position seçenekleri
  const positionOptions = [
    { value: 'founding-partner', label: 'Kurucu Ortak' },
    { value: 'partner', label: 'Ortak' },
    { value: 'senior-associate', label: 'Kıdemli Avukat' },
    { value: 'associate', label: 'Avukat' },
    { value: 'trainee', label: 'Stajyer' }
  ];

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, filterPosition, filterActive]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterPosition) params.append('position', filterPosition);
      if (filterActive) params.append('active', filterActive);

      const response = await fetch(`/api/admin/team?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (memberId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/team/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const response = await fetch(`/api/admin/team/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMembers();
        setShowDeleteModal(false);
        setMemberToDelete(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getPositionLabel = (position) => {
    return positionOptions.find(p => p.value === position)?.label || position;
  };

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchMembers();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const TeamMemberCard = ({ member }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-amber-600" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              {member.featuredOnHomepage && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            <p className="text-sm text-gray-600">{member.title}</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
              member.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {member.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative group">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <MoreVertical className="w-4 h-4" />
          </button>
          
          <div className="absolute right-0 top-8 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 z-10">
            <Link
              href={`/admin/team/${member._id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4" />
              <span>Düzenle</span>
            </Link>
            
            <button
              onClick={() => handleToggleActive(member._id, member.isActive)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {member.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{member.isActive ? 'Pasifleştir' : 'Aktifleştir'}</span>
            </button>

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

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Pozisyon</span>
          <span className="text-sm font-medium text-gray-900">
            {getPositionLabel(member.position)}
          </span>
        </div>

        {member.birthPlace && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Doğum Yeri</span>
            <span className="text-sm font-medium text-gray-900 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {member.birthPlace}
            </span>
          </div>
        )}

        {member.specializations && member.specializations.length > 0 && (
          <div>
            <span className="text-sm text-gray-500 block mb-2">Uzmanlık Alanları</span>
            <div className="flex flex-wrap gap-1">
              {member.specializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
              {member.specializations.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  +{member.specializations.length - 3} daha
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
          <span>Sıra: {member.sortOrder || 0}</span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(member.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ekip Yönetimi</h1>
          <p className="text-gray-600">Ekip üyelerini yönetin ve düzenleyin</p>
        </div>
        
        <Link
          href="/admin/team/create"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Üye Ekle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="İsim veya ünvan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Position Filter */}
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterPosition('');
              setFilterActive('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Filtreleri Temizle
          </button>
        </div>

        {/* Results Info */}
        {pagination && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {pagination.total} üyeden {((pagination.page - 1) * pagination.limit) + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
            </p>
          </div>
        )}
      </div>

      {/* Team Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ekip üyesi bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterPosition || filterActive 
              ? 'Arama kriterlerinize uygun sonuç bulunamadı'
              : 'Henüz hiç ekip üyesi eklenmemiş'
            }
          </p>
          <Link
            href="/admin/team/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            İlk Üyeyi Ekle
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Önceki
          </button>
          
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 text-sm rounded-lg ${
                currentPage === i + 1
                  ? 'bg-amber-500 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && memberToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Üyeyi Sil
            </h3>
            <p className="text-gray-600 mb-6">
              <strong>{memberToDelete.name}</strong> adlı ekip üyesini silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMemberToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteMember(memberToDelete._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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