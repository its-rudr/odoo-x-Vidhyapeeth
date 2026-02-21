// Role-based permissions configuration for FleetFlow
// Defines which modules each role can access and what actions they can perform

export const ROLE_PERMISSIONS = {
  manager: {
    label: 'Fleet Manager',
    description: 'Full access to all modules',
    modules: {
      dashboard: { view: true },
      vehicles: { view: true, create: true, edit: true, delete: true },
      trips: { view: true, create: true, edit: true, delete: true },
      maintenance: { view: true, create: true, edit: true, delete: true },
      expenses: { view: true, create: true, edit: true, delete: true },
      drivers: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true },
    },
  },
  dispatcher: {
    label: 'Dispatcher',
    description: 'Manage trips and view fleet assets',
    modules: {
      dashboard: { view: true },
      vehicles: { view: true, create: true, edit: true, delete: false },
      trips: { view: true, create: true, edit: true, delete: false },
      maintenance: { view: false, create: false, edit: false, delete: false },
      expenses: { view: false, create: false, edit: false, delete: false },
      drivers: { view: true, create: false, edit: false, delete: false },
      analytics: { view: false },
    },
  },
  safety_officer: {
    label: 'Safety Officer',
    description: 'Manage drivers, maintenance & vehicle safety',
    modules: {
      dashboard: { view: true },
      vehicles: { view: true, create: true, edit: true, delete: false },
      trips: { view: true, create: false, edit: false, delete: false },
      maintenance: { view: true, create: true, edit: true, delete: false },
      expenses: { view: false, create: false, edit: false, delete: false },
      drivers: { view: true, create: true, edit: true, delete: false },
      analytics: { view: false },
    },
  },
  analyst: {
    label: 'Financial Analyst',
    description: 'Manage expenses & view analytics reports',
    modules: {
      dashboard: { view: true },
      vehicles: { view: true, create: false, edit: false, delete: false },
      trips: { view: true, create: false, edit: false, delete: false },
      maintenance: { view: false, create: false, edit: false, delete: false },
      expenses: { view: true, create: true, edit: true, delete: false },
      drivers: { view: false, create: false, edit: false, delete: false },
      analytics: { view: true },
    },
  },
};

// Map route paths to module names
export const ROUTE_MODULE_MAP = {
  '/': 'dashboard',
  '/vehicles': 'vehicles',
  '/trips': 'trips',
  '/maintenance': 'maintenance',
  '/expenses': 'expenses',
  '/drivers': 'drivers',
  '/analytics': 'analytics',
};

// Check if a role has permission for a module action
export function hasPermission(role, module, action = 'view') {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  const moduleConfig = roleConfig.modules[module];
  if (!moduleConfig) return false;
  return moduleConfig[action] === true;
}

// Get all viewable modules for a role
export function getViewableModules(role) {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return [];
  return Object.entries(roleConfig.modules)
    .filter(([_, perms]) => perms.view)
    .map(([module]) => module);
}

// Get role label
export function getRoleLabel(role) {
  return ROLE_PERMISSIONS[role]?.label || role;
}
