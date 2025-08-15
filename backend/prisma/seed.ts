// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Permissions ---
  const permissions = [
    { action: 'create', subject: 'user' },
    { action: 'read', subject: 'user' },
    { action: 'update', subject: 'user' },
    { action: 'delete', subject: 'user' },
  ];

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });

  // --- Create Roles ---
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        connect: permissions.map((p) => ({
          action_subject: { action: p.action, subject: p.subject },
        })),
      },
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
    },
  });

  const extraRoles = [
    'CEO',
    'MARKETING_MANAGER',
    'MARKETING_HEAD',
    'MARKETING_EMPLOYEE',
    'SALES_MANAGER',
    'SALES_HEAD',
    'SALES_EMPLOYEE',
  ];

  for (const name of extraRoles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Create Users ---
  const passwordHash = await bcrypt.hash('admin@example.com', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      employeeId: 'EMP001',
      email: 'admin@example.com',
      password: passwordHash,
      prefix: 'Mr.',
      firstName: 'Admin',
      lastName: 'System',
      age: 30,
      gender: 'Male',
      phone: '0800000000',
      birthDate: new Date('1994-01-01'),
      address: '123 Main St',
      province: 'Bangkok',
      postalCode: '10000',
      position: 'Administrator',
      department: 'IT',
      startDate: new Date(),
      status: 'Active',
      company: 'My Company',
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      employeeId: 'EMP002',
      email: 'user@example.com',
      password: passwordHash,
      prefix: 'Ms.',
      firstName: 'Normal',
      lastName: 'User',
      age: 25,
      gender: 'Female',
      phone: '0811111111',
      birthDate: new Date('1999-05-05'),
      address: '456 Main St',
      province: 'Chiang Mai',
      postalCode: '50000',
      position: 'Staff',
      department: 'Sales',
      startDate: new Date(),
      status: 'Active',
      company: 'My Company',
      roleId: userRole.id,
    },
  });

  console.log('✅ Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
