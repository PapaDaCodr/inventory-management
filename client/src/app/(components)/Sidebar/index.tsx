"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
  ShoppingCart,
  Truck,
  BarChart3,
  Package,
  Users,
  CreditCard,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  requiredRoles?: UserRole[];
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  requiredRoles = [],
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  // Check if user has required role
  if (requiredRoles.length > 0 && profile) {
    const hasRequiredRole = requiredRoles.includes(profile.role);
    if (!hasRequiredRole) {
      return null; // Don't render link if user doesn't have required role
    }
  }

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        }
        hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? "bg-blue-200 text-white" : ""
        }
      }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />

        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl`}
        >
          SIMS
        </h1>

        <button
          type="button"
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8">
        {/* Common Links - Available to all authenticated users */}
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />

        {/* Role-Specific Dashboards */}
        <SidebarLink
          href="/admin"
          icon={Shield}
          label="Admin Panel"
          isCollapsed={isSidebarCollapsed}
          requiredRoles={['administrator']}
        />

        <SidebarLink
          href="/manager"
          icon={BarChart3}
          label="Manager Hub"
          isCollapsed={isSidebarCollapsed}
          requiredRoles={['administrator', 'manager']}
        />

        <SidebarLink
          href="/inventory-clerk"
          icon={Archive}
          label="Inventory Control"
          isCollapsed={isSidebarCollapsed}
          requiredRoles={['administrator', 'manager', 'inventory_clerk']}
        />

        <SidebarLink
          href="/cashier"
          icon={CreditCard}
          label="POS Terminal"
          isCollapsed={isSidebarCollapsed}
          requiredRoles={['administrator', 'manager', 'cashier']}
        />

        <SidebarLink
          href="/supplier"
          icon={Truck}
          label="Supplier Portal"
          isCollapsed={isSidebarCollapsed}
          requiredRoles={['administrator', 'manager', 'supplier']}
        />

        {/* Legacy pages removed - functionality moved to role-based dashboards */}

        {/* Note: Functionality moved to role-based dashboards */}
        {/* Suppliers -> /supplier, POS -> /cashier, Analytics -> /manager, etc. */}

        {/* Settings - Admins and Managers */}
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
          requiredRoles={['administrator', 'manager']}
        />

        {/* Note: User management moved to Admin Dashboard */}
        {/* Note: Inventory/Products moved to role-based dashboards */}
        {/* Note: Expenses functionality to be implemented in Manager Hub */}
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500">&copy; 2025 SIMS</p>
      </div>
    </div>
  );
};

export default Sidebar;
