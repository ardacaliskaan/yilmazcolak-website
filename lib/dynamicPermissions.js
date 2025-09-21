// lib/dynamicPermissions.js - Fixed - `module` değişken adları değiştirildi
import dbConnect from '@/lib/dbConnect';
import PermissionModule from '@/models/Permission';
import RoleTemplate from '@/models/RoleTemplate';
import User from '@/models/User';

// Cache için
let moduleCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// 🔍 Aktif modülleri getir (cache'li)
export async function getActiveModules() {
  const now = Date.now();
  
  if (moduleCache && cacheExpiry && now < cacheExpiry) {
    return moduleCache;
  }
  
  try {
    await dbConnect();
    const modules = await PermissionModule.find({ isActive: true })
      .sort({ menuOrder: 1, name: 1 })
      .lean();
    
    moduleCache = modules;
    cacheExpiry = now + CACHE_DURATION;
    
    return modules;
  } catch (error) {
    console.error('Get active modules error:', error);
    return [];
  }
}

// 🧹 Cache temizle
export function clearModuleCache() {
  moduleCache = null;
  cacheExpiry = null;
}

// ✅ Dinamik yetki kontrolü - Ana fonksiyon
export async function hasPermission(user, moduleKey, action) {
  if (!user || !user.permissions) return false;
  
  // Super admin her şeyi yapabilir
  if (user.role === 'super-admin') return true;
  
  // Modül aktif mi kontrol et
  const modules = await getActiveModules();
  const permissionModule = modules.find(m => m.key === moduleKey);
  
  if (!permissionModule || !permissionModule.isActive) return false;
  
  // Kullanıcının yetkilerini kontrol et
  const modulePermission = user.permissions.find(p => p.module === moduleKey);
  return modulePermission?.actions.includes(action) || false;
}

// 🤖 Yeni kullanıcı için otomatik yetki ataması
export async function assignDefaultPermissions(userData) {
  try {
    await dbConnect();
    
    const roleTemplate = await RoleTemplate.findOne({ role: userData.role });
    if (!roleTemplate) {
      console.log(`⚠️  Rol şablonu bulunamadı: ${userData.role}`);
      return [];
    }
    
    const modules = await getActiveModules();
    const permissions = [];
    
    console.log(`🤖 ${userData.role} için otomatik yetki ataması başlıyor...`);
    
    for (const permissionModule of modules) {
      // Bu modül için rol şablonunda kural var mı?
      const autoRule = roleTemplate.autoGrantRules.find(
        rule => rule.moduleCategory === permissionModule.category
      );
      
      if (autoRule && (autoRule.condition === 'always' || autoRule.condition === 'on-create')) {
        // Modülün bu rol için default yetkilerini al
        const moduleDefault = permissionModule.defaultPermissions.find(dp => dp.role === userData.role);
        
        if (moduleDefault && moduleDefault.actions.length > 0) {
          // Auto rule'da belirtilen eylemlerle default'ı kesişir
          let actionsToGrant = autoRule.actions.filter(action => 
            moduleDefault.actions.includes(action)
          );
          
          // Eğer kesişim yoksa sadece default'ı kullan
          if (actionsToGrant.length === 0) {
            actionsToGrant = moduleDefault.actions;
          }
          
          if (actionsToGrant.length > 0) {
            permissions.push({
              module: permissionModule.key,
              actions: actionsToGrant
            });
            
            console.log(`✅ ${permissionModule.name}: [${actionsToGrant.join(', ')}]`);
          }
        }
      }
    }
    
    console.log(`🎉 ${userData.role} için ${permissions.length} modül yetkisi atandı`);
    return permissions;
    
  } catch (error) {
    console.error('Assign default permissions error:', error);
    return [];
  }
}

// 🔄 Yeni modül eklendiğinde tüm kullanıcılara otomatik yetki ver
export async function autoGrantPermissionsForNewModule(moduleData) {
  try {
    await dbConnect();
    
    console.log(`🔄 Yeni modül tespit edildi: ${moduleData.name}`);
    
    // Rol şablonlarını getir
    const roleTemplates = await RoleTemplate.find({});
    
    let totalUpdated = 0;
    
    // Her rol için kullanıcıları getir ve yetki ata
    for (const roleTemplate of roleTemplates) {
      const autoRule = roleTemplate.autoGrantRules.find(
        rule => rule.moduleCategory === moduleData.category
      );
      
      if (!autoRule || autoRule.condition === 'never') {
        continue;
      }
      
      // Bu rolde ve aktif olan kullanıcıları getir
      const users = await User.find({ 
        role: roleTemplate.role, 
        isActive: true 
      });
      
      console.log(`👥 ${roleTemplate.role} rolünde ${users.length} kullanıcı bulundu`);
      
      for (const user of users) {
        // Mevcut yetkilerini al
        const existingPermissions = user.permissions || [];
        
        // Bu modül için yetki var mı kontrol et
        const modulePermissionIndex = existingPermissions.findIndex(
          p => p.module === moduleData.key
        );
        
        if (modulePermissionIndex !== -1) {
          console.log(`⏭️  ${user.name} zaten ${moduleData.key} yetkisine sahip`);
          continue;
        }
        
        // Verilecek eylemleri belirle
        let actionsToGrant = [];
        
        if (autoRule.condition === 'always' || autoRule.condition === 'on-create') {
          // Modülün bu rol için default permissions'ını kontrol et
          const moduleDefault = moduleData.defaultPermissions.find(
            dp => dp.role === roleTemplate.role
          );
          
          if (moduleDefault) {
            // Auto rule'da belirtilen eylemlerle default'ı kesişir
            actionsToGrant = autoRule.actions.filter(action => 
              moduleDefault.actions.includes(action)
            );
            
            // Eğer kesişim yoksa sadız default'ı kullan
            if (actionsToGrant.length === 0) {
              actionsToGrant = moduleDefault.actions;
            }
          }
        }
        
        if (actionsToGrant.length > 0) {
          // Yeni modül yetkisi ekle
          existingPermissions.push({
            module: moduleData.key,
            actions: actionsToGrant
          });
          
          // Kullanıcıyı güncelle
          await User.findByIdAndUpdate(user._id, { 
            permissions: existingPermissions 
          });
          
          console.log(`✅ ${user.name} → ${moduleData.key}: [${actionsToGrant.join(', ')}]`);
          totalUpdated++;
        }
      }
    }
    
    console.log(`🎉 ${moduleData.name} için toplam ${totalUpdated} kullanıcıya yetki atandı`);
    
  } catch (error) {
    console.error('Auto grant permissions error:', error);
  }
}

// 📊 Audit - kullanıcı yetkileri tutarlı mı?
export async function auditUserPermissions() {
  try {
    await dbConnect();
    
    const users = await User.find({ isActive: true });
    const modules = await getActiveModules();
    
    console.log(`🔍 ${users.length} kullanıcı için permission audit...`);
    
    let auditResults = [];
    
    for (const user of users) {
      const userModules = user.permissions?.map(p => p.module) || [];
      const availableModules = modules.map(m => m.key);
      
      // Bu role sahip olması gereken modüller
      const expectedModules = [];
      
      for (const permissionModule of modules) {
        const roleDefault = permissionModule.defaultPermissions.find(dp => dp.role === user.role);
        if (roleDefault && roleDefault.actions.length > 0) {
          expectedModules.push(permissionModule.key);
        }
      }
      
      // Eksik modüller
      const missingModules = expectedModules.filter(em => !userModules.includes(em));
      
      // Fazla modüller (artık mevcut olmayan)
      const extraModules = userModules.filter(um => !availableModules.includes(um));
      
      if (missingModules.length > 0 || extraModules.length > 0) {
        auditResults.push({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          missingModules,
          extraModules,
          currentModules: userModules.length,
          expectedModules: expectedModules.length
        });
      }
    }
    
    console.log(`📊 Audit tamamlandı: ${auditResults.length} kullanıcıda tutarsızlık`);
    
    return auditResults;
  } catch (error) {
    console.error('User permissions audit error:', error);
    throw error;
  }
}

// 🔧 Hızlı yeni modül kaydetme (development helper)
export async function registerModule(moduleData) {
  try {
    await dbConnect();
    
    // Mevcut modül kontrolü
    const existingModule = await PermissionModule.findOne({ key: moduleData.key });
    if (existingModule) {
      console.log(`⚠️  Modül zaten mevcut: ${moduleData.key}`);
      return existingModule;
    }
    
    // Yeni modül oluştur
    const newModule = await PermissionModule.create(moduleData);
    console.log(`✅ Yeni modül kaydedildi: ${moduleData.name}`);
    
    // Cache temizle
    clearModuleCache();
    
    // Otomatik yetki ataması yap
    await autoGrantPermissionsForNewModule(moduleData);
    
    return newModule;
  } catch (error) {
    console.error('Register module error:', error);
    throw error;
  }
}