import {
  mapRolePermissions,
  mapUserRoles,
  permissionFormSchema,
  roleFormSchema,
  userFormSchema,
} from './page';

describe('Admin page form schemas', () => {
  it('requires at least one role when creating a user', () => {
    const result = userFormSchema.safeParse({
      employeeId: 'EMP001',
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      roleIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('เลือกอย่างน้อย 1 บทบาท');
    }
  });

  it('accepts optional password for updates', () => {
    const result = userFormSchema.safeParse({
      employeeId: 'EMP002',
      name: 'Another User',
      email: 'another@example.com',
      roleIds: [1],
    });

    expect(result.success).toBe(true);
  });

  it('allows empty permission selection for roles', () => {
    const result = roleFormSchema.safeParse({
      name: 'VIEWER',
      permissionIds: [],
    });

    expect(result.success).toBe(true);
  });

  it('validates permission form shape', () => {
    const result = permissionFormSchema.safeParse({ name: 'read_user' });

    expect(result.success).toBe(true);
  });
});

describe('Admin page helpers', () => {
  it('maps user roles safely', () => {
    expect(
      mapUserRoles({
        id: 1,
        employeeId: 'EMP010',
        email: 'demo@example.com',
        name: 'Demo User',
        userRoles: [
          { role: { id: 1, name: 'ADMIN' } },
          { role: { id: 2, name: 'USER' } },
        ],
      } as any),
    ).toEqual([1, 2]);
    expect(mapUserRoles(null)).toEqual([]);
  });

  it('maps role permissions safely', () => {
    expect(
      mapRolePermissions({
        id: 1,
        name: 'ADMIN',
        rolePermissions: [
          { permission: { id: 1, name: 'read_user' } },
          { permission: { id: 2, name: 'add_user' } },
        ],
      } as any),
    ).toEqual([1, 2]);
    expect(mapRolePermissions(undefined)).toEqual([]);
  });
});
