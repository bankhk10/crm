"use client";

import PermissionButtons from "@/components/PermissionButtons";
import AdminPanelView from "@/src/app/(admin)/page";

export default function AdminPage() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="text-muted-foreground">
          จัดการสิทธิ์และบทบาทของผู้ใช้งานภายในระบบจากส่วนกลาง
        </p>
      </div>
      <PermissionButtons />
      <AdminPanelView />
    </div>
  );
}
