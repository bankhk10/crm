'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="bg-white w-full h-full rounded-2xl flex items-center justify-center shadow-lg">
      <h1 className="text-4xl font-bold text-gray-700">
        สวัสดี {user?.name || 'Admin'}
      </h1>
    </div>
  );
}
