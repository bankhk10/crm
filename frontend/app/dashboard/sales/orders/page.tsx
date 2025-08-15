"use client";

import { useAuth } from "@/context/AuthContext";

export default function SalesOrdersPage() {
  const { user } = useAuth();

  const hasPermission = (action: string) =>
    user?.role?.permissions?.some(
      (p: any) => p.action === action && p.subject === "sales"
    );

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8 space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">รายการขาย (Sales Orders)</h1>
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
      <p>เนื้อหาของหน้ารายการขายจะแสดงที่นี่...</p>
      {/* You can add a table or list of sales orders here later */}
    </div>
  );
}
