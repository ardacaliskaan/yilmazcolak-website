// scripts/seedPermissions.js - İlk Veri Yükleme Script'i
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yilmazcolak-hukuk';

// Şemalar (models import etmek yerine burada tanımlıyoruz)
const permissionModuleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Settings' },
  color: { type: String, default: 'blue' },
  menuOrder: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false },
  availableActions: [{
    key: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    color: { type: String, default: 'gray' }
  }],
  defaultPermissions: [{
    role: { type: String, required: true },
    actions: [String]
  }],
  category: { type: String, default: 'core' }
}, { timestamps: true });

const roleTemplateSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  autoGrantRules: [{
    moduleCategory: String,
    actions: [String],
    condition: { type: String, default: 'manual' }
  }],
  level: { type: Number, required: true },
  isSystem: { type: Boolean, default: true }
}, { timestamps: true });

// 📦 Core Modüller
const coreModules = [
  {
    key: 'team',
    name: 'Ekip Yönetimi',
    description: 'Ekip üyelerini yönetin, düzenleyin',
    icon: 'Users',
    color: 'blue',
    menuOrder: 10,
    isSystem: true,
    category: 'core',
    availableActions: [
      { key: 'create', name: 'Oluştur', description: 'Yeni ekip üyesi ekle', color: 'green' },
      { key: 'read', name: 'Görüntüle', description: 'Ekip üyelerini listele', color: 'blue' },
      { key: 'update', name: 'Düzenle', description: 'Ekip üyesi bilgilerini güncelle', color: 'orange' },
      { key: 'delete', name: 'Sil', description: 'Ekip üyesini kaldır', color: 'red' }
    ],
    defaultPermissions: [
      { role: 'super-admin', actions: ['create', 'read', 'update', 'delete'] },
      { role: 'admin', actions: ['create', 'read', 'update', 'delete'] },
      { role: 'editor', actions: ['read', 'update'] },
      { role: 'moderator', actions: ['read'] }
    ]
  },
  {
    key: 'users',
    name: 'Kullanıcı Yönetimi',
    description: 'Sistem kullanıcılarını yönetin',
    icon: 'Shield',
    color: 'purple',
    menuOrder: 20,
    isSystem: true,
    category: 'users',
    availableActions: [
      { key: 'create', name: 'Oluştur', description: 'Yeni kullanıcı ekle', color: 'green' },
      { key: 'read', name: 'Görüntüle', description: 'Kullanıcıları listele', color: 'blue' },
      { key: 'update', name: 'Düzenle', description: 'Kullanıcı bilgilerini güncelle', color: 'orange' },
      { key: 'delete', name: 'Sil', description: 'Kullanıcıyı kaldır', color: 'red' }
    ],
    defaultPermissions: [
      { role: 'super-admin', actions: ['create', 'read', 'update', 'delete'] },
      { role: 'admin', actions: ['read', 'update'] },
      { role: 'editor', actions: [] },
      { role: 'moderator', actions: [] }
    ]
  },
  {
    key: 'articles',
    name: 'Makale Yönetimi',
    description: 'Blog makalelerini yönetin',
    icon: 'FileText',
    color: 'green',
    menuOrder: 30,
    isSystem: true,
    category: 'content',
    availableActions: [
      { key: 'create', name: 'Oluştur', description: 'Yeni makale yaz', color: 'green' },
      { key: 'read', name: 'Görüntüle', description: 'Makaleleri listele', color: 'blue' },
      { key: 'update', name: 'Düzenle', description: 'Makale içeriğini güncelle', color: 'orange' },
      { key: 'delete', name: 'Sil', description: 'Makaleyi kaldır', color: 'red' },
      { key: 'publish', name: 'Yayınla', description: 'Makaleyi yayınla/gizle', color: 'indigo' }
    ],
    defaultPermissions: [
      { role: 'super-admin', actions: ['create', 'read', 'update', 'delete', 'publish'] },
      { role: 'admin', actions: ['create', 'read', 'update', 'delete', 'publish'] },
      { role: 'editor', actions: ['create', 'read', 'update'] },
      { role: 'moderator', actions: ['read', 'update'] }
    ]
  },
  {
    key: 'content',
    name: 'İçerik Yönetimi',
    description: 'Site içeriklerini yönetin',
    icon: 'Layout',
    color: 'orange',
    menuOrder: 40,
    isSystem: true,
    category: 'content',
    availableActions: [
      { key: 'read', name: 'Görüntüle', description: 'İçerikleri görüntüle', color: 'blue' },
      { key: 'update', name: 'Düzenle', description: 'İçerikleri düzenle', color: 'orange' }
    ],
    defaultPermissions: [
      { role: 'super-admin', actions: ['read', 'update'] },
      { role: 'admin', actions: ['read', 'update'] },
      { role: 'editor', actions: ['read', 'update'] },
      { role: 'moderator', actions: ['read'] }
    ]
  },
  {
    key: 'settings',
    name: 'Sistem Ayarları',
    description: 'Genel sistem ayarları',
    icon: 'Settings',
    color: 'gray',
    menuOrder: 90,
    isSystem: true,
    category: 'settings',
    availableActions: [
      { key: 'read', name: 'Görüntüle', description: 'Ayarları görüntüle', color: 'blue' },
      { key: 'update', name: 'Düzenle', description: 'Ayarları güncelle', color: 'orange' }
    ],
    defaultPermissions: [
      { role: 'super-admin', actions: ['read', 'update'] },
      { role: 'admin', actions: ['read'] },
      { role: 'editor', actions: [] },
      { role: 'moderator', actions: [] }
    ]
  }
];

// 👥 Rol Şablonları
const roleTemplates = [
  {
    role: 'super-admin',
    name: 'Super Admin',
    description: 'Tüm sistem yetkileri, sınırsız erişim',
    level: 1,
    autoGrantRules: [
      {
        moduleCategory: 'core',
        actions: ['create', 'read', 'update', 'delete'],
        condition: 'always'
      },
      {
        moduleCategory: 'content',
        actions: ['create', 'read', 'update', 'delete', 'publish'],
        condition: 'always'
      },
      {
        moduleCategory: 'users',
        actions: ['create', 'read', 'update', 'delete'],
        condition: 'always'
      },
      {
        moduleCategory: 'settings',
        actions: ['read', 'update'],
        condition: 'always'
      },
      {
        moduleCategory: 'tools',
        actions: ['create', 'read', 'update', 'delete'],
        condition: 'always'
      }
    ]
  },
  {
    role: 'admin',
    name: 'Admin',
    description: 'Gelişmiş yönetim yetkileri',
    level: 2,
    autoGrantRules: [
      {
        moduleCategory: 'core',
        actions: ['create', 'read', 'update', 'delete'],
        condition: 'on-create'
      },
      {
        moduleCategory: 'content',
        actions: ['create', 'read', 'update', 'delete', 'publish'],
        condition: 'on-create'
      },
      {
        moduleCategory: 'users',
        actions: ['read', 'update'],
        condition: 'on-create'
      },
      {
        moduleCategory: 'tools',
        actions: ['read', 'update'],
        condition: 'manual'
      }
    ]
  },
  {
    role: 'editor',
    name: 'Editor',
    description: 'İçerik oluşturma ve düzenleme yetkileri',
    level: 3,
    autoGrantRules: [
      {
        moduleCategory: 'content',
        actions: ['create', 'read', 'update'],
        condition: 'on-create'
      },
      {
        moduleCategory: 'core',
        actions: ['read', 'update'],
        condition: 'manual'
      }
    ]
  },
  {
    role: 'moderator',
    name: 'Moderator',
    description: 'Sınırlı düzenleme ve görüntüleme yetkileri',
    level: 4,
    autoGrantRules: [
      {
        moduleCategory: 'content',
        actions: ['read', 'update'],
        condition: 'on-create'
      }
    ]
  }
];

async function seedPermissions() {
  try {
    console.log('🚀 Dinamik Permission Sistemi kurulumu başlıyor...\n');
    
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Model'leri oluştur
    const PermissionModule = mongoose.models.PermissionModule || mongoose.model('PermissionModule', permissionModuleSchema);
    const RoleTemplate = mongoose.models.RoleTemplate || mongoose.model('RoleTemplate', roleTemplateSchema);

    // Mevcut sistem modüllerini temizle (sadece system: true olanları)
    console.log('🧹 Mevcut sistem verileri temizleniyor...');
    await PermissionModule.deleteMany({ isSystem: true });
    await RoleTemplate.deleteMany({ isSystem: true });

    // Rol şablonlarını ekle
    console.log('👥 Rol şablonları ekleniyor...');
    await RoleTemplate.insertMany(roleTemplates);
    console.log(`✅ ${roleTemplates.length} rol şablonu eklendi`);

    // Core modülleri ekle
    console.log('🔧 Core modüller ekleniyor...');
    await PermissionModule.insertMany(coreModules);
    console.log(`✅ ${coreModules.length} core modül eklendi`);

    console.log('\n🎉 Dinamik Permission Sistemi başarıyla kuruldu!');
    console.log('\n📋 Eklenen Modüller:');
    coreModules.forEach(module => {
      console.log(`   • ${module.name} (${module.key}) - ${module.category}`);
    });
    
    console.log('\n👥 Eklenen Roller:');
    roleTemplates.forEach(role => {
      console.log(`   • ${role.name} (${role.role}) - Level ${role.level}`);
    });

    console.log('\n🔄 Şimdi mevcut kullanıcılarınıza otomatik yetki ataması yapılacak...');
    console.log('💡 Kullanıcı oluştururken artık otomatik yetkiler atanacak!');
    
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
seedPermissions();

// package.json scripts kısmına eklenecek:
// "seed:permissions": "node scripts/seedPermissions.js"