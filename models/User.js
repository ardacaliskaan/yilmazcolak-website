// models/User.js - Admin Kullanıcı Modeli
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    select: false // Varsayılan olarak şifre döndürülmez
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
    enum: ['create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'publish']
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

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);