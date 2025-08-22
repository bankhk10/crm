// prisma/seed.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Node 18+ มี fetch ให้ใช้อยู่แล้ว
const prisma = new PrismaClient();

async function fetchJsonWithRetry(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === tries) throw e;
      // หน่วงนิดนึงก่อนรีทราย
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // --- 1) โหลดข้อมูลจังหวัด/อำเภอ/ตำบล ---
  const [
    provinceData,
    amphureData,
    tambonData,
  ] = await Promise.all([
    fetchJsonWithRetry('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json'),
    fetchJsonWithRetry('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json'),
    fetchJsonWithRetry('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json'),
  ]);

  await prisma.province.createMany({
    data: provinceData.map((p) => ({ id: p.id, name_th: p.name_th })),
    skipDuplicates: true,
  });

  await prisma.amphure.createMany({
    data: amphureData.map((a) => ({
      id: a.id,
      name_th: a.name_th,
      province_id: a.province_id,
    })),
    skipDuplicates: true,
  });

  await prisma.tambon.createMany({
    data: tambonData.map((t) => ({
      id: t.id,
      name_th: t.name_th,
      amphure_id: t.amphure_id,
      zip_code: t.zip_code,
    })),
    skipDuplicates: true,
  });

  // --- 2) Permissions / Roles ---
  const actions = ['create', 'read', 'update', 'delete'];
  const subjects = ['user', 'marketing', 'sales', 'report'];

  const permissions = subjects.flatMap((subject) =>
    actions.map((action) => ({ action, subject })),
  );
  await prisma.permission.createMany({ data: permissions, skipDuplicates: true });

  const connectAll = permissions.map((p) => ({
    action_subject: { action: p.action, subject: p.subject },
  }));
  const connectSubject = (subject, allowDelete) =>
    actions
      .filter((a) => allowDelete || a !== 'delete')
      .map((action) => ({ action_subject: { action, subject } }));
  const readSubject = (subject) => [
    { action_subject: { action: 'read', subject } },
  ];

  const roleSpecs = [
    { name: 'ADMIN', perms: connectAll },
    { name: 'USER', perms: [] },
    { name: 'CEO', perms: connectAll },
    {
      name: 'MARKETING_MANAGER',
      perms: connectSubject('marketing', true).concat(readSubject('report')),
    },
    { name: 'MARKETING_HEAD', perms: connectSubject('marketing', true) },
    { name: 'MARKETING_EMPLOYEE', perms: connectSubject('marketing', false) },
    {
      name: 'SALES_MANAGER',
      perms: connectSubject('sales', true).concat(readSubject('report')),
    },
    { name: 'SALES_HEAD', perms: connectSubject('sales', true) },
    { name: 'SALES_EMPLOYEE', perms: connectSubject('sales', false) },
  ];

  const roles = {};
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

  // --- 3) Users ---
  // ใส่ password เดียวกันให้ทุก user (เปลี่ยนทีหลังได้)
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
