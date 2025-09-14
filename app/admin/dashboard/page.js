// app/admin/dashboard/page.js - Dashboard Sayfası
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  TrendingUp,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    totalArticles: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Burada tüm dashboard verilerini çek
      const [teamResponse] = await Promise.all([
        fetch('/api/admin/team?limit=1000')
      ]);

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setStats(prev => ({
          ...prev,
          totalTeamMembers: teamData.pagination?.total || 0,
          activeTeamMembers: teamData.members?.filter(m => m.isActive).length || 0
        }));
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {change.value}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Admin paneline hoş geldiniz.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Ekip"
          value={stats.totalTeamMembers}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Aktif Üyeler"
          value={stats.activeTeamMembers}
          icon={Activity}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Makaleler"
          value={stats.totalArticles}
          icon={FileText}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="Ayarlar"
          value="4"
          icon={Settings}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <a
            href="/admin/team"
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ekip Yönet</p>
                <p className="text-sm text-gray-500">Ekip üyelerini düzenle</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/articles"
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-200">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Yeni Makale</p>
                <p className="text-sm text-gray-500">Makale ekle/düzenle</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/settings"
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ayarlar</p>
                <p className="text-sm text-gray-500">Sistem ayarları</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Henüz aktivite bulunmuyor</p>
          )}
        </div>
      </div>
    </div>
  );
}