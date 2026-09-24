import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  PERMISSION_KEYS,
  USER_ROLE_PERMISSIONS,
  SYSTEM_PERMISSIONS,
} from '../src/modules/roles/permissions.registry';

const prisma = new PrismaClient();

async function main() {
  for (const key of PERMISSION_KEYS) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        description: `Permission: ${key}`,
      },
    });
    console.log(`Created/found permission: ${permission.key}`);
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Full access to all system resources',
      isSystem: true,
      permissions: {
        create: PERMISSION_KEYS.map((key) => ({
          permission: { connect: { key } },
        })),
      },
    },
  });
  console.log(`Created/found super_admin role: ${superAdminRole.id}`);

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Standard user with booking capabilities',
      permissions: {
        create: USER_ROLE_PERMISSIONS.map((key) => ({
          permission: { connect: { key } },
        })),
      },
    },
  });
  console.log(`Created/found user role: ${userRole.id}`);

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with management capabilities',
      permissions: {
        create: [
          ...USER_ROLE_PERMISSIONS,
          'users:read',
          'users:write',
          'roles:read',
          'roles:manage',
          'users:delete',
        ].map((key) => ({
          permission: { connect: { key } },
        })),
      },
    },
  });
  console.log(`Created/found admin role: ${adminRole.id}`);

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: 'admin@skylane.dev' },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await argon2.hash('ChangeMeInProduction!2024');

    const superAdminUser = await prisma.user.create({
      data: {
        email: 'admin@skylane.dev',
        password: hashedPassword,
        name: 'Super Admin',
        roleId: superAdminRole.id,
      },
    });
    console.log(`Created super admin user: ${superAdminUser.id}`);
  } else {
    console.log('Super admin user already exists');
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
