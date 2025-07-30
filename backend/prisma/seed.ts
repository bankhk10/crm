import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Hashing password ---
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  // --- Create Permissions ---
  const permissionsData = [
    // User Permissions
    { action: 'create', subject: 'User' },
    { action: 'read', subject: 'User' },
    { action: 'update', subject: 'User' },
    { action: 'delete', subject: 'User' },
    // Role Permissions
    { action: 'create', subject: 'Role' },
    { action: 'read', subject: 'Role' },
    { action: 'update', subject: 'Role' },
    { action: 'delete', subject: 'Role' },
    // Permission Permissions
    { action: 'read', subject: 'Permission' },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { action_subject: { action: p.action, subject: p.subject } },
      update: {},
      create: p,
    });
  }
  console.log('Permissions created.');

  const allPermissions = await prisma.permission.findMany();

  // --- Create Roles and Assign Permissions ---
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      permissions: {
        connect: allPermissions
          .filter(
            (p) =>
              p.subject === 'User' &&
              (p.action === 'read' || p.action === 'create'),
          )
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      permissions: {
        connect: allPermissions
          .filter((p) => p.subject === 'User' && p.action === 'read')
          .map((p) => ({ id: p.id })),
      },
    },
  });
  console.log('Roles created.');

  // --- Create Users ---
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: hashedPassword,
      roleId: managerRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
      roleId: userRole.id,
    },
  });
  console.log('Users created.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
