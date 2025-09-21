// models/RoleTemplate.js - Rol Şablonları
import mongoose from 'mongoose';

const roleTemplateSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
    enum: ['super-admin', 'admin', 'editor', 'moderator']
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Otomatik yetki ataması kuralları
  autoGrantRules: [{
    moduleCategory: {
      type: String,
      enum: ['core', 'content', 'users', 'settings', 'tools']
    },
    actions: [String],
    condition: {
      type: String,
      enum: ['always', 'never', 'on-create', 'manual'],
      default: 'manual'
    }
  }],
  
  // Rol hierarchy
  level: {
    type: Number,
    required: true
  },
  
  // Sistem rolü mü
  isSystem: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.RoleTemplate || mongoose.model('RoleTemplate', roleTemplateSchema);