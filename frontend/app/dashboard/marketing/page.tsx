"use client";

import { useAuth } from "@/context/AuthContext";

export default function MarketingPage() {
  const { user } = useAuth();

  const hasPermission = (action: string) =>
    user?.role?.permissions?.some(
      (p: any) => p.action === action && p.subject === "marketing"
    );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">การตลาด</h1>
      <div className="space-x-2">
        {hasPermission("create") && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded">สร้าง</button>
        )}
        {hasPermission("update") && (
          <button className="bg-yellow-500 text-white px-4 py-2 rounded">แก้ไข</button>
        )}
        {hasPermission("delete") && (
          <button className="bg-red-600 text-white px-4 py-2 rounded">ลบ</button>
        )}
      </div>
      <p>หน้านี้จะแสดงข้อมูลการตลาด (กำลังพัฒนา)</p>
    </div>
  );
}
