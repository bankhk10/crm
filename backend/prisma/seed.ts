// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const actions = ['create', 'read', 'update', 'delete'];
  const subjects = ['user', 'marketing', 'sales'];

  const permissions = subjects.flatMap((subject) =>
    actions.map((action) => ({ action, subject }))
  );
  await prisma.permission.createMany({ data: permissions, skipDuplicates: true });

  const connectAll = permissions.map((p) => ({
    action_subject: { action: p.action, subject: p.subject },
  }));
  const connectSubject = (subject: string, allowDelete: boolean) =>
    actions
      .filter((a) => allowDelete || a !== 'delete')
      .map((action) => ({ action_subject: { action, subject } }));

  const roleSpecs = [
    { name: 'ADMIN', perms: connectAll },
    { name: 'USER', perms: [] },
    { name: 'CEO', perms: connectAll },
    { name: 'MARKETING_MANAGER', perms: connectSubject('marketing', true) },
    { name: 'MARKETING_HEAD', perms: connectSubject('marketing', true) },
    { name: 'MARKETING_EMPLOYEE', perms: connectSubject('marketing', false) },
    { name: 'SALES_MANAGER', perms: connectSubject('sales', true) },
    { name: 'SALES_HEAD', perms: connectSubject('sales', true) },
    { name: 'SALES_EMPLOYEE', perms: connectSubject('sales', false) },
  ];

  const roles: Record<string, { id: number }> = {};
  for (const spec of roleSpecs) {
    roles[spec.name] = await prisma.role.upsert({
      where: { name: spec.name },
      update: {},
      create: {
        name: spec.name,
        ...(spec.perms.length ? { permissions: { connect: spec.perms } } : {}),
      },
    });
  }

  const passwordHash = await bcrypt.hash('admin@example.com', 10);

  const userSpecs = [
    {
      employeeId: 'EMP001',
      email: 'admin@example.com',
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
      role: 'ADMIN',
    },
    {
      employeeId: 'EMP002',
      email: 'user@example.com',
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
      role: 'USER',
    },
    { employeeId: 'EMP010', email: 'ceo@example.com', name: 'CEO', role: 'CEO' },
    {
      employeeId: 'EMP011',
      email: 'marketing.manager@example.com',
      name: 'Marketing Manager',
      role: 'MARKETING_MANAGER',
    },
    {
      employeeId: 'EMP003',
      email: 'marketing.head@example.com',
      name: 'Marketing Head',
      role: 'MARKETING_HEAD',
    },
    {
      employeeId: 'EMP004',
      email: 'marketing.employee@example.com',
      name: 'Marketing Employee',
      role: 'MARKETING_EMPLOYEE',
    },
    {
      employeeId: 'EMP012',
      email: 'sales.manager@example.com',
      name: 'Sales Manager',
      role: 'SALES_MANAGER',
    },
    {
      employeeId: 'EMP005',
      email: 'sales.head@example.com',
      name: 'Sales Head',
      role: 'SALES_HEAD',
    },
    {
      employeeId: 'EMP006',
      email: 'sales.employee@example.com',
      name: 'Sales Employee',
      role: 'SALES_EMPLOYEE',
    },
  ];

  for (const { role, ...data } of userSpecs) {
    await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password: passwordHash,
        roleId: roles[role].id,
      },
    });
  }

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
