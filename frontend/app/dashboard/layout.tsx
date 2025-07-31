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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar component now receives state for mobile view */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header component receives a function to toggle the sidebar */}
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          {/* The main content area */}
          {children}
        </main>
      </div>
    </div>
  );
}
