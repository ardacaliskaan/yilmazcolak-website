// scripts/listUsers.mjs
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yilmazcolak-hukuk';
const SHOW_HASHES = process.env.SHOW_HASHES === '1';

// Şemayı Minimal Tanımlıyoruz (Projeden İçe Aktarmaya Gerek Yok)
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true, unique: true },
  password: { type: String, select: false },
  role: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  try {
    console.log('🔌 Connecting MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Şifreyi Görmek İsterseniz SHOW_HASHES=1 İle Çalıştırın
    const projection = SHOW_HASHES ? '+password' : '';
    const docs = await User.find({}, null).select(projection).lean().exec();

    if (!docs.length) {
      console.log('ℹ️  No Users Found.');
      return;
    }

    // Konsol İçin Temiz Tablo
    const table = docs.map(u => ({
      id: u._id.toString(),
      name: u.name || '',
      email: u.email || '',
      role: u.role || '',
      isActive: u.isActive ?? true,
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : '',
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
      ...(SHOW_HASHES ? { password: mask(u.password) } : {}),
    }));

    console.table(table);
    console.log(`✅ Total Users: ${docs.length}`);
  } catch (err) {
    console.error('❌ Error:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

function mask(hash) {
  if (!hash || typeof hash !== 'string') return '';
  if (hash.length <= 10) return '***';
  return hash.slice(0, 6) + '...' + hash.slice(-4);
}

main();
