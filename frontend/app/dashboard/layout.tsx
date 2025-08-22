"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    main?.scrollTo({ top: 0 });
    // ensure window and document scroll positions reset as well
    window.scrollTo({ top: 0 });
    document.documentElement.scrollTop = 0;
  }, [pathname]);

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
  <div className="fixed inset-0 flex bg-[#b92626]"> {/* แทน h-screen ด้วย fixed inset-0 */}
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

    <div className="flex-1 min-h-0 min-w-0 flex flex-col"> {/* สำคัญ: min-h-0 */}
      <div className="shrink-0">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
      </div>

      {/* สกอร์ลตัวเดียวของทั้งหน้า */}
      <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto bg-gray-100 rounded-tl-3xl p-4 md:p-8">
        {children}
      </main>
    </div>
  </div>
);

}
