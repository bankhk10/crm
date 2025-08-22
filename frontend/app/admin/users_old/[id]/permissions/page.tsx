"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  role: Role;
}

export default function EditUserPermissions({ params }: { params: { id: string } }) {
  const { user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState<number | undefined>();

  useEffect(() => {
    if (!isLoading) {
      if (currentUser?.role.name !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      const fetchData = async () => {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`/users/${params.id}`),
          api.get("/roles"),
        ]);
        setUser(userRes.data);
        setRoleId(userRes.data.role.id);
        setRoles(rolesRes.data);
      };
      fetchData();
    }
  }, [currentUser, isLoading, params.id, router]);

  const handleSave = async () => {
    try {
      await api.patch(`/users/${params.id}`, { roleId });
      toast.success("อัปเดตสิทธิ์เรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ไม่สามารถอัปเดตสิทธิ์ได้");
    }
  };

  if (isLoading || !currentUser || currentUser.role.name !== "ADMIN" || !user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">แก้ไขสิทธิ์: {user.name}</h1>
      <select
        value={roleId}
        onChange={(e) => setRoleId(Number(e.target.value))}
        className="border px-4 py-2 rounded"
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <div className="space-x-2">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          บันทึก
        </button>
        <Link
          href="/admin/users"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
        >
          ย้อนกลับ
        </Link>
      </div>
    </div>
  );
}
