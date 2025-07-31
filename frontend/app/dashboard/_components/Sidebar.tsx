'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart2, 
  Activity, 
  Calendar, 
  Map, 
  Box, 
  ShoppingCart, 
  Megaphone, 
  Users, 
  UserCog 
} from 'lucide-react';

// --- Placeholder Logo Component ---
const Logo = () => (
  <div className="bg-white p-4 flex items-center justify-center mb-8">
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md mb-2">
        {/* Replace with your actual logo image */}
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      </div>
      <div className="bg-black text-white text-center text-lg font-bold px-6 py-1 rounded-md">
        ตราปืนใหญ่
      </div>
    </div>
  </div>
);

const navItems = [
  { href: '/dashboard', label: 'รายงาน', icon: BarChart2 },
  { href: '/dashboard/activities', label: 'กิจกรรม', icon: Activity },
  { href: '/dashboard/calendar', label: 'ปฏิทิน', icon: Calendar },
  { href: '/dashboard/map', label: 'แผนที่', icon: Map },
  { href: '/dashboard/products', label: 'สินค้า', icon: Box },
  { href: '/dashboard/sales', label: 'การขาย', icon: ShoppingCart },
  { href: '/dashboard/marketing', label: 'การตลาด', icon: Megaphone },
  { href: '/dashboard/customers', label: 'ลูกค้า', icon: Users },
  { href: '/admin/users', label: 'พนักงาน', icon: UserCog },
];

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div className={`flex items-center p-3 text-white rounded-r-full cursor-pointer transition-colors ${isActive ? 'bg-white text-[#D42A2A] font-bold' : 'hover:bg-red-700'}`}>
        <Icon className="mr-4" size={20} />
        <span>{label}</span>
      </div>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#D42A2A] flex flex-col">
      <Logo />
      <nav className="flex-1 pr-4">
        {navItems.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>
    </div>
  );
}