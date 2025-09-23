// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const [provinceData, amphureData, tambonData] = await Promise.all([
    fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json').then((r) => r.json()),
    fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json').then((r) => r.json()),
    fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json').then((r) => r.json()),
  ]);

  await prisma.province.createMany({
    data: provinceData.map((p: any) => ({ id: p.id, name_th: p.name_th })),
    skipDuplicates: true,
  });

  await prisma.amphure.createMany({
    data: amphureData.map((a: any) => ({
      id: a.id,
      name_th: a.name_th,
      province_id: a.province_id,
    })),
    skipDuplicates: true,
  });

  await prisma.tambon.createMany({
    data: tambonData.map((t: any) => ({
      id: t.id,
      name_th: t.name_th,
      amphure_id: t.amphure_id,
      zip_code: t.zip_code,
    })),
    skipDuplicates: true,
  });

  const permissionNames = [
    'read_user',
    'add_user',
    'edit_user',
    'remove_user',
    'assign_role_to_user',
    'unassign_role_from_user',
    'read_role',
    'add_role',
    'edit_role',
    'remove_role',
    'assign_permission_to_role',
    'unassign_permission_from_role',
    'read_permission',
    'add_permission',
    'edit_permission',
    'remove_permission',
  ];

  const permissions: Record<string, { id: number }> = {};
  for (const name of permissionNames) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    permissions[name] = permission;
  }

  const rolePermissionMap: Record<string, string[]> = {
    SUPER_ADMIN: permissionNames,
    ADMIN: permissionNames.filter(
      (name) => !['add_permission', 'edit_permission', 'remove_permission'].includes(name),
    ),
    MANAGER: [
      'read_user',
      'add_user',
      'edit_user',
      'assign_role_to_user',
      'unassign_role_from_user',
      'read_role',
    ],
    USER: ['read_user'],
    GUEST: [],
  };

  for (const roleName of Object.keys(rolePermissionMap)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const permissionIds = rolePermissionMap[roleName].map((perm) => permissions[perm].id);
    if (permissionIds.length) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      });
    }
  }

  const passwordHash = await bcrypt.hash('admin@example.com', 10);

  const userSpecs = [
    {
      employeeId: 'EMP001',
      email: 'admin@example.com',
      prefix: 'Mr.',
      firstName: 'Super',
      lastName: 'Admin',
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
      roles: ['SUPER_ADMIN'],
      type: 'Admin',
    },
    {
      employeeId: 'EMP002',
      email: 'manager@example.com',
      firstName: 'Team',
      lastName: 'Manager',
      position: 'Manager',
      department: 'Sales',
      startDate: new Date(),
      status: 'Active',
      roles: ['MANAGER'],
      type: 'GM',
    },
    {
      employeeId: 'EMP003',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      status: 'Active',
      roles: ['USER'],
      type: 'User',
    },
    {
      employeeId: 'EMP004',
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'Viewer',
      status: 'Active',
      roles: ['GUEST'],
      type: 'User',
    },
  ];

  for (const { roles: roleNames, ...data } of userSpecs) {
    await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        name: [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
        password: passwordHash,
        userRoles: {
          create: roleNames.map((roleName) => ({
            role: { connect: { name: roleName } },
          })),
        },
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
