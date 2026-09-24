export const PERMISSIONS = [
  // Auth / Users
  { key: 'users:read', description: 'Read all users' },
  { key: 'users:write', description: 'Create or update users' },
  { key: 'users:delete', description: 'Delete users' },

  // Roles / Permissions
  { key: 'roles:manage', description: 'Manage roles and assign permissions' },
  { key: 'roles:read', description: 'Read role information' },

  // Flights
  { key: 'flights:search', description: 'Search for available flights' },
  { key: 'flights:read', description: 'Read flight details and offers' },

  // Bookings
  { key: 'bookings:create', description: 'Create bookings' },
  { key: 'bookings:read', description: 'Read all bookings' },
  { key: 'bookings:cancel', description: 'Cancel a booking' },
  { key: 'bookings:change', description: 'Change a booking' },

  // Payments
  { key: 'payments:create', description: 'Create payments' },
  { key: 'payments:refund', description: 'Refund a payment' },
  { key: 'payments:read', description: 'Read payment information' },

  // Webhooks
  { key: 'webhooks:manage', description: 'Manage webhook endpoints' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export const SYSTEM_PERMISSIONS: PermissionKey[] = ['roles:manage'];

export const USER_ROLE_PERMISSIONS: PermissionKey[] = [
  'flights:search',
  'flights:read',
  'bookings:create',
  'bookings:read',
  'bookings:cancel',
  'payments:create',
];