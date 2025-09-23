'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

type RBACUser = {
  roles?: string[];
  permissions?: string[];
} | null | undefined;

const formatKey = (value?: string) => value?.toLowerCase().trim();

const buildPermissionKey = (action?: string, resource?: string) => {
  const normalizedAction = formatKey(action);
  if (!normalizedAction) return '';
  const normalizedResource = formatKey(resource);
  return normalizedResource ? `${normalizedAction}_${normalizedResource}` : normalizedAction;
};

export const can = (user: RBACUser, action: string, resource?: string) => {
  if (!user) return false;
  const permissionKey = buildPermissionKey(action, resource);
  if (!permissionKey) return false;
  const permissions = user.permissions ?? [];
  return permissions.map((permission) => permission.toLowerCase()).includes(permissionKey);
};

export const isRole = (user: RBACUser, ...roles: string[]) => {
  if (!user || !roles.length) return false;
  const roleSet = new Set((user.roles ?? []).map((role) => role.toUpperCase()));
  return roles.some((role) => roleSet.has(role.toUpperCase()));
};

export const useRBAC = () => {
  const { user } = useAuth();
  const memoUser = useMemo(() => user ?? { roles: [], permissions: [] }, [user]);

  const hasPermission = useCallback(
    (action: string, resource?: string) => can(memoUser, action, resource),
    [memoUser],
  );

  const hasRole = useCallback((...roles: string[]) => isRole(memoUser, ...roles), [memoUser]);

  return {
    user,
    can: hasPermission,
    hasPermission,
    hasRole,
    isRole: hasRole,
  };
};
