// scripts/resetAdmin.js - Yeni Script (Admin sıfırlama için)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yilmazcolak-hukuk';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  permissions: Array,
  isActive: Boolean
}, { timestamps: true });

async function resetAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Tüm kullanıcıları sil
    await User.deleteMany({});
    console.log('🗑️ Mevcut kullanıcılar silindi');

    // Yeni super admin oluştur
    const hashedPassword = await bcrypt.hash('YilmazColak2024!', 12);
    
    await User.create({
      name: 'Yusuf Çolak',
      email: 'admin@yilmazcolak.com',
      password: hashedPassword,
      role: 'super-admin',
      permissions: [
        { module: 'team', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'articles', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'settings', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'content', actions: ['create', 'read', 'update', 'delete'] }
      ],
      isActive: true
    });

    console.log('✅ Yeni super admin oluşturuldu');
    console.log('📧 Email: admin@yilmazcolak.com');
    console.log('🔑 Şifre: YilmazColak2024!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

resetAdmin();
