// models/Permission.js - Dinamik Yetki Tanımları
import mongoose from 'mongoose';

const permissionModuleSchema = new mongoose.Schema({
  // Modül temel bilgileri
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // UI bilgileri
  icon: {
    type: String,
    default: 'Settings'
  },
  color: {
    type: String,
    default: 'blue'
  },
  menuOrder: {
    type: Number,
    default: 100
  },
  
  // Durum bilgileri
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false // Core modüller için (silinemeyen)
  },
  
  // Eylemler
  availableActions: [{
    key: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'publish']
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    color: {
      type: String,
      default: 'gray'
    }
  }],
  
  // Yetki şablonları (rollere göre varsayılan yetkiler)
  defaultPermissions: [{
    role: {
      type: String,
      enum: ['super-admin', 'admin', 'editor', 'moderator'],
      required: true
    },
    actions: [String]
  }],
  
  // Meta data
  version: {
    type: String,
    default: '1.0.0'
  },
  category: {
    type: String,
    enum: ['core', 'content', 'users', 'settings', 'tools'],
    default: 'core'
  }
}, {
  timestamps: true
});

// İndeksler
permissionModuleSchema.index({ key: 1 });
permissionModuleSchema.index({ isActive: 1, menuOrder: 1 });

export default mongoose.models.PermissionModule || mongoose.model('PermissionModule', permissionModuleSchema);

