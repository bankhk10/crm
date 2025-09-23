import { render, screen } from '@testing-library/react';
import { PermissionGate } from './PermissionGate';
import { RoleGate } from './RoleGate';
import { useRBAC } from '@/src/lib/rbac';

jest.mock('@/src/lib/rbac', () => ({
  useRBAC: jest.fn(),
}));

const useRBACMock = useRBAC as jest.MockedFunction<typeof useRBAC>;

describe('RBAC gate components', () => {
  beforeEach(() => {
    useRBACMock.mockReset();
  });

  it('renders children when role is allowed', () => {
    useRBACMock.mockReturnValue({
      hasRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn(),
      can: jest.fn(),
      isRole: jest.fn(),
      user: { roles: ['ADMIN'], permissions: [] },
    } as any);

    render(
      <RoleGate roles={['ADMIN']}>
        <span>allowed</span>
      </RoleGate>,
    );

    expect(screen.getByText('allowed')).toBeInTheDocument();
  });

  it('renders fallback when role is not allowed', () => {
    useRBACMock.mockReturnValue({
      hasRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn(),
      can: jest.fn(),
      isRole: jest.fn(),
      user: { roles: ['USER'], permissions: [] },
    } as any);

    render(
      <RoleGate roles={['ADMIN']} fallback={<span>blocked</span>}>
        <span>allowed</span>
      </RoleGate>,
    );

    expect(screen.getByText('blocked')).toBeInTheDocument();
  });

  it('renders children when permission is granted', () => {
    useRBACMock.mockReturnValue({
      hasRole: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(true),
      can: jest.fn().mockReturnValue(true),
      isRole: jest.fn(),
      user: { roles: [], permissions: ['add_user'] },
    } as any);

    render(
      <PermissionGate can="add_user">
        <span>permitted</span>
      </PermissionGate>,
    );

    expect(screen.getByText('permitted')).toBeInTheDocument();
  });

  it('renders fallback when permission is missing', () => {
    useRBACMock.mockReturnValue({
      hasRole: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(false),
      can: jest.fn().mockReturnValue(false),
      isRole: jest.fn(),
      user: { roles: [], permissions: [] },
    } as any);

    render(
      <PermissionGate can="add_user" fallback={<span>denied</span>}>
        <span>permitted</span>
      </PermissionGate>,
    );

    expect(screen.getByText('denied')).toBeInTheDocument();
  });
});
