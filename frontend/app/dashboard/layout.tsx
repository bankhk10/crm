'use client';

import React, { ReactNode, useState } from 'react';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Should be handled by middleware
  }

  return (
    // 1. เปลี่ยนพื้นหลังหลักของทั้งหน้าเป็นสีแดง
    <div className="flex h-screen bg-[#D42A2A]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* 2. ทำให้พื้นที่แสดงเนื้อหามีพื้นหลังสีเทาและเพิ่มมุมโค้งมนที่สวยงามด้านบนซ้าย */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 rounded-tl-3xl p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
