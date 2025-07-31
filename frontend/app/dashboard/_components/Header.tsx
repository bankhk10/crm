'use client';

import { Bell, Globe, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header({ user }: { user: any }) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-end items-center">
      <div className="flex items-center space-x-6 text-gray-600">
        <button className="hover:text-gray-900"><Bell size={22} /></button>
        <button className="hover:text-gray-900"><Globe size={22} /></button>
        <div className="flex items-center space-x-2">
          <UserCircle size={24} />
          <span className="font-medium">{user?.name || 'Admin'}</span>
        </div>
        <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700 font-semibold">
          <LogOut size={20} className="mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
}
