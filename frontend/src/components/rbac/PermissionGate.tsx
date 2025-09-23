'use client';

import { ReactNode } from 'react';
import { useRBAC } from '@/src/lib/rbac';

type PermissionGateProps = {
  can: string;
  resource?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export const PermissionGate = ({ can: permission, resource, fallback = null, children }: PermissionGateProps) => {
  const { hasPermission } = useRBAC();
  if (hasPermission(permission, resource)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
