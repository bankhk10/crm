"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart2,
  Activity,
  Calendar,
  Map,
  Box,
  ShoppingCart,
  Megaphone,
  Users,
  UserCog,
  Shield,
  X,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

// --- Data structure for navigation items ---
const navItems = [
  { href: "/dashboard", label: "รายงาน", icon: BarChart2 },
  { href: "/dashboard/activities", label: "กิจกรรม", icon: Activity },
  { href: "/dashboard/calendar", label: "ปฏิทิน", icon: Calendar },
  { href: "/dashboard/map", label: "แผนที่", icon: Map },
  { href: "/dashboard/products", label: "สินค้า", icon: Box },
  {
    href: "/dashboard/sales",
    label: "การขาย",
    icon: ShoppingCart,
    children: [
      { href: "/dashboard/sales/orders", label: "รายการขาย" },
      { href: "/dashboard/sales/quotations", label: "ใบเสนอราคา" },
    ],
  },
  { href: "/dashboard/marketing", label: "การตลาด", icon: Megaphone },
  {
    href: "/dashboard/customers",
    label: "ลูกค้า",
    icon: Users,
    children: [
      { href: "/dashboard/customers/list", label: "รายชื่อลูกค้า" },
      // { href: "/dashboard/customers/create", label: "สร้างลูกค้าใหม่" },
    ],
  },
  { href: "/dashboard/employee", label: "พนักงาน", icon: UserCog },
  { href: "/dashboard/roles", label: "สิทธิ์", icon: Shield },
  // { href: "/admin/roles", label: "สิทธิ์", icon: Shield },
];

// Restrict menu visibility based on role
const roleMenuRestrictions: Record<string, string[]> = {
  MARKETING_MANAGER: ["/dashboard/sales"],
  MARKETING_HEAD: ["/dashboard", "/dashboard/sales"],
  MARKETING_EMPLOYEE: ["/dashboard", "/dashboard/sales"],
  SALES_MANAGER: ["/dashboard/marketing"],
  SALES_HEAD: ["/dashboard", "/dashboard/marketing"],
  SALES_EMPLOYEE: ["/dashboard", "/dashboard/marketing"],
};

const Logo = () => (
  <div className="bg-red-650 p-4 flex items-center justify-center mb-6 mr-5 mt-4">
    <div className="relative w-36 h-36 rounded-lg overflow-hidden p-2">
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  </div>
);

// --- NavItem Component ---
const NavItem = ({
  item,
  isOpen,
  onClick,
  onLinkClick,
}: {
  item: any;
  isOpen: boolean;
  onClick: () => void;
  onLinkClick: () => void;
}) => {
  const pathname = usePathname();
  const isParentActive = item.children && pathname.startsWith(item.href);

  if (item.children) {
    return (
      <div>
        <button
          onClick={onClick}
          className={`w-full flex items-center justify-between p-3 text-white cursor-pointer transition-colors rounded-full ${
            isParentActive ? "bg-red-800" : "hover:bg-red-700"
          }`}
        >
          <div className="flex items-center">
            <item.icon className="mr-4" size={20} />
            <span>{item.label}</span>
          </div>
          <ChevronDown
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={16}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="pl-8 pt-2 space-y-1">
            {item.children.map((child: any) => (
              <Link key={child.href} href={child.href} onClick={onLinkClick}>
                <div
                  className={`block p-2 text-sm rounded-md transition-colors ${
                    pathname === child.href
                      ? "text-white font-bold"
                      : "text-red-200 hover:text-white"
                  }`}
                >
                  {child.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isActive = pathname === item.href;
  return (
    <Link href={item.href} onClick={onLinkClick}>
      <div
        className={`flex items-center p-3 text-white cursor-pointer transition-colors rounded-full ${
          isActive ? "bg-red-800 text-white font-bold" : "hover:bg-red-700"
        }`}
      >
        <item.icon className="mr-4" size={20} />
        <span>{item.label}</span>
      </div>
    </Link>
  );
};

// --- Main Sidebar Component ---
export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    const roleName = user?.role.name;

    if (item.href.startsWith("/admin")) {
      return roleName === "ADMIN" || roleName === "CEO";
    }

    const restricted =
      roleMenuRestrictions[roleName as keyof typeof roleMenuRestrictions] || [];
    return !restricted.includes(item.href);
  });

  // This effect ensures the correct submenu is open based on the current URL
  useEffect(() => {
    // Find if the current path belongs to a parent menu with children
    const parentMenu = navItems.find(
      (item) => item.children && pathname.startsWith(item.href)
    );

    if (parentMenu) {
      // If it does, set that parent menu as open
      setOpenMenu(parentMenu.href);
    } else {
      // If the current path is not part of any submenu, close all submenus
      setOpenMenu(null);
    }
  }, [pathname]);

  const handleMenuClick = (href: string) => {
    setOpenMenu(openMenu === href ? null : href);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`
        fixed inset-y-0 left-0 bg-[#b92626] w-64 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white md:hidden"
        >
          <X size={24} />
        </button>
        <Logo />

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          {filteredNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isOpen={openMenu === item.href}
              onClick={() => handleMenuClick(item.href)}
              onLinkClick={onClose}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
