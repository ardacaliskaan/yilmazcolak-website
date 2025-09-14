// lib/permissions.js - Yetki Sistemi
export const MODULES = {
  TEAM: 'team',
  ARTICLES: 'articles',
  SETTINGS: 'settings',
  USERS: 'users',
  CONTENT: 'content'
};

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  MODERATOR: 'moderator'
};

// Varsayılan rol yetkileri
export const DEFAULT_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    { module: MODULES.TEAM, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.ARTICLES, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.SETTINGS, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.USERS, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.CONTENT, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] }
  ],
  [ROLES.ADMIN]: [
    { module: MODULES.TEAM, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.ARTICLES, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.CONTENT, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { module: MODULES.USERS, actions: [ACTIONS.READ, ACTIONS.UPDATE] }
  ],
  [ROLES.EDITOR]: [
    { module: MODULES.TEAM, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
    { module: MODULES.ARTICLES, actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE] },
    { module: MODULES.CONTENT, actions: [ACTIONS.READ, ACTIONS.UPDATE] }
  ],
  [ROLES.MODERATOR]: [
    { module: MODULES.ARTICLES, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
    { module: MODULES.CONTENT, actions: [ACTIONS.READ] }
  ]
};

// Yetki kontrol fonksiyonu
export const hasPermission = (user, module, action) => {
  if (!user || !user.permissions) return false;
  
  // Super admin her şeyi yapabilir
  if (user.role === ROLES.SUPER_ADMIN) return true;
  
  const modulePermission = user.permissions.find(p => p.module === module);
  return modulePermission?.actions.includes(action) || false;
};