// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Permissions ---
  const actions = ['create', 'read', 'update', 'delete'];
  const subjects = ['user', 'marketing', 'sales'];
  const permissions = subjects.flatMap((subject) =>
    actions.map((action) => ({ action, subject }))
  );

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });

  const connectAllPermissions = permissions.map((p) => ({
    action_subject: { action: p.action, subject: p.subject },
  }));

  const connectSubjectPermissions = (subject: string, allowDelete: boolean) =>
    actions
      .filter((a) => allowDelete || a !== 'delete')
      .map((action) => ({ action_subject: { action, subject } }));

  // --- Create Roles ---
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: { connect: connectAllPermissions },
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  const ceoRole = await prisma.role.upsert({
    where: { name: 'CEO' },
    update: {},
    create: {
      name: 'CEO',
      permissions: { connect: connectAllPermissions },
    },
  });

  const marketingManagerRole = await prisma.role.upsert({
    where: { name: 'MARKETING_MANAGER' },
    update: {},
    create: {
      name: 'MARKETING_MANAGER',
      permissions: { connect: connectSubjectPermissions('marketing', true) },
    },
  });

  const marketingHeadRole = await prisma.role.upsert({
    where: { name: 'MARKETING_HEAD' },
    update: {},
    create: {
      name: 'MARKETING_HEAD',
      permissions: { connect: connectSubjectPermissions('marketing', true) },
    },
  });

  const marketingEmployeeRole = await prisma.role.upsert({
    where: { name: 'MARKETING_EMPLOYEE' },
    update: {},
    create: {
      name: 'MARKETING_EMPLOYEE',
      permissions: { connect: connectSubjectPermissions('marketing', false) },
    },
  });

  const salesManagerRole = await prisma.role.upsert({
    where: { name: 'SALES_MANAGER' },
    update: {},
    create: {
      name: 'SALES_MANAGER',
      permissions: { connect: connectSubjectPermissions('sales', true) },
    },
  });

  const salesHeadRole = await prisma.role.upsert({
    where: { name: 'SALES_HEAD' },
    update: {},
    create: {
      name: 'SALES_HEAD',
      permissions: { connect: connectSubjectPermissions('sales', true) },
    },
  });

  const salesEmployeeRole = await prisma.role.upsert({
    where: { name: 'SALES_EMPLOYEE' },
    update: {},
    create: {
      name: 'SALES_EMPLOYEE',
      permissions: { connect: connectSubjectPermissions('sales', false) },
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

  await prisma.user.upsert({
    where: { email: 'marketing.head@example.com' },
    update: {},
    create: {
      employeeId: 'EMP003',
      email: 'marketing.head@example.com',
      password: passwordHash,
      name: 'Marketing Head',
      roleId: marketingHeadRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'marketing.employee@example.com' },
    update: {},
    create: {
      employeeId: 'EMP004',
      email: 'marketing.employee@example.com',
      password: passwordHash,
      name: 'Marketing Employee',
      roleId: marketingEmployeeRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales.head@example.com' },
    update: {},
    create: {
      employeeId: 'EMP005',
      email: 'sales.head@example.com',
      password: passwordHash,
      name: 'Sales Head',
      roleId: salesHeadRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales.employee@example.com' },
    update: {},
    create: {
      employeeId: 'EMP006',
      email: 'sales.employee@example.com',
      password: passwordHash,
      name: 'Sales Employee',
      roleId: salesEmployeeRole.id,
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
