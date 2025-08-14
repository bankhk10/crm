'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
   <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        หน้ารายงาน (Dashboard)
      </h1>
      <p>เนื้อหาของหน้ารายงานจะแสดงที่นี่...</p>
    </div>
  );
}
