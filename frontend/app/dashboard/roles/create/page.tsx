'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface Permission {
  id: number;
  action: string;
  subject: string;
}

const actionLabels: Record<string, string> = {
  read: 'อ่าน',
  create: 'สร้าง',
  update: 'แก้ไข',
  delete: 'ลบ',
};

export default function RolePermissionMatrixPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isLoading && user?.role?.name !== 'ADMIN') {
      toast.error("Access Denied: You don't have permission to view this page.");
      router.push('/dashboard');
      return;
    }
    if (user?.role?.name === 'ADMIN') {
      api
        .get('/permissions')
        .then((res) => setPermissions(res.data ?? []))
        .catch(() => toast.error('Failed to fetch permissions.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    for (const p of permissions) {
      if (!map[p.subject]) map[p.subject] = [];
      map[p.subject].push(p);
    }
    return map;
  }, [permissions]);

  const toggle = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => Number(id));
    toast.success(`เลือกสิทธิ์ทั้งหมด ${ids.length} รายการ`);
    console.log('Selected permission ids', ids);
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-sm text-gray-500">Checking permissions…</div>
      </div>
    );
  }

  const actionOrder = ['read', 'create', 'update', 'delete'];

  return (
    <Card className="w-full rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>สร้างสิทธิ์การใช้งาน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">เมนู</th>
                {actionOrder.map((a) => (
                  <th key={a} className="px-6 py-3 text-center">
                    {actionLabels[a.replace(',', '')] || a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([subject, perms]) => (
                <tr key={subject} className="border-b">
                  <td className="px-6 py-4 font-medium">{subject}</td>
                  {actionOrder.map((a) => {
                    const action = a.replace(',', '');
                    const perm = perms.find((p) => p.action === action);
                    return (
                      <td key={action} className="px-6 py-4 text-center">
                        {perm ? (
                          <Checkbox
                            checked={!!selected[perm.id]}
                            onCheckedChange={() => toggle(perm.id)}
                          />
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>บันทึก</Button>
        </div>
      </CardContent>
    </Card>
  );
}

