// scripts/createSuperAdmin.js - Super Admin Oluşturma Script'i
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DEFAULT_PERMISSIONS, ROLES } from '../lib/permissions.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yilmazcolak-hukuk';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email zorunludur'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'editor', 'moderator'],
    default: 'editor'
  },
  permissions: [{
    module: {
      type: String,
      required: true,
      enum: ['team', 'articles', 'settings', 'users', 'content']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete']
    }]
  }],
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Şifre hash'leme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut super admin kontrolü
    const existingAdmin = await User.findOne({ role: 'super-admin' });
    
    if (existingAdmin) {
      console.log('❌ Super admin zaten mevcut:', existingAdmin.email);
      return;
    }

    // Super admin oluştur
    const superAdminData = {
      name: 'Yusuf Çolak',
      email: 'admin@yilmazcolak.av.tr', // Bu email adresini değiştirebilirsin
      password: 'Karabuk2578.', // Bu şifreyi güvenli bir şifre ile değiştir
      role: ROLES.SUPER_ADMIN,
      permissions: DEFAULT_PERMISSIONS[ROLES.SUPER_ADMIN],
      isActive: true
    };

    const superAdmin = await User.create(superAdminData);
    
    console.log('✅ Tüm modüllere tam yetki verildi');

    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('✅ MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
createSuperAdmin();

// package.json scripts kısmına eklenecek:
// "create-admin": "node scripts/createSuperAdmin.js"