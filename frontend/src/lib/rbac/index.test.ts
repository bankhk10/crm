import { renderHook } from '@testing-library/react';
import { can, isRole, useRBAC } from './index';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;

describe('RBAC utilities', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('checks permissions using the can helper', () => {
    const user = { permissions: ['add_user', 'READ_ROLE'], roles: [] };

    expect(can(user, 'add_user')).toBe(true);
    expect(can(user, 'read', 'role')).toBe(true);
    expect(can(user, 'edit_user')).toBe(false);
    expect(can(null, 'add_user')).toBe(false);
  });

  it('checks roles using the isRole helper', () => {
    const user = { roles: ['ADMIN', 'User'] };

    expect(isRole(user, 'ADMIN')).toBe(true);
    expect(isRole(user, 'user')).toBe(true);
    expect(isRole(user, 'manager')).toBe(false);
    expect(isRole(null, 'ADMIN')).toBe(false);
  });

  it('derives helpers from useRBAC hook', () => {
    useAuthMock.mockReturnValue({
      user: { roles: ['SUPER_ADMIN'], permissions: ['assign_role_to_user'] },
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useRBAC());

    expect(result.current.hasRole('admin', 'super_admin')).toBe(true);
    expect(result.current.hasPermission('assign_role_to_user')).toBe(true);
    expect(result.current.hasPermission('remove_role')).toBe(false);
  });

  it('handles missing auth user in useRBAC hook', () => {
    useAuthMock.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useRBAC());

    expect(result.current.hasRole('ADMIN')).toBe(false);
    expect(result.current.hasPermission('read_user')).toBe(false);
  });
});
