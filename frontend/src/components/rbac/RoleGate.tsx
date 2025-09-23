'use client';

import { ReactNode } from 'react';
import { useRBAC } from '@/src/lib/rbac';

type RoleGateProps = {
  roles: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export const RoleGate = ({ roles, fallback = null, children }: RoleGateProps) => {
  const { hasRole } = useRBAC();
  if (hasRole(...roles)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
