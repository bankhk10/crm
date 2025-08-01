'use client';

import { Bell, Globe, UserCircle, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header({ user, onMenuClick }: { user: any; onMenuClick: () => void }) {
  const { logout } = useAuth();

  return (
    // 1. เปลี่ยนพื้นหลังเป็นโปร่งใส และเปลี่ยนสีข้อความ/ไอคอนเป็นสีขาว
    <header className="bg-transparent text-white p-4 flex justify-between items-center">
      {/* Hamburger Menu Button for Mobile */}
      <button onClick={onMenuClick} className="md:hidden">
        <Menu size={24} />
      </button>

      {/* Spacer to push other items to the right on desktop */}
      <div className="hidden md:block flex-1"></div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="hover:text-gray-200"><Bell size={22} /></button>
        <button className="hover:text-gray-200"><Globe size={22} /></button>
        <div className="flex items-center space-x-2">
          <UserCircle size={24} />
          <span className="font-medium hidden sm:inline">{user?.name || 'Admin'}</span>
        </div>
        <button onClick={logout} className="flex items-center hover:text-gray-200 font-semibold">
          <LogOut size={20} className="mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
