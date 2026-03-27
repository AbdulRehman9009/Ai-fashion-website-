"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Scissors,
  Truck,
  Settings,
  LogOut,
  Users,
  Package,
  PlusCircle,
  Home,
  BarChart3,
  DollarSign,
  X,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ role, isOpen, onClose }) {
  const pathname = usePathname();

  // Role accents for active states (text & soft background)
  const roleAccents = {
    USER: "text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-500/10 border-blue-200 dark:border-blue-900",
    TAILOR: "text-purple-600 bg-purple-50/80 dark:text-purple-400 dark:bg-purple-500/10 border-purple-200 dark:border-purple-900",
    SHOPKEEPER: "text-orange-600 bg-orange-50/80 dark:text-orange-400 dark:bg-orange-500/10 border-orange-200 dark:border-orange-900",
    DELIVERY: "text-green-600 bg-green-50/80 dark:text-green-400 dark:bg-green-500/10 border-green-200 dark:border-green-900",
    ADMIN: "text-red-600 bg-red-50/80 dark:text-red-400 dark:bg-red-500/10 border-red-200 dark:border-red-900",
  };

  const links = {
    USER: [
      { href: "/dashboard/user", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/user/products", label: "Browse Products", icon: Package },
      { href: "/dashboard/user/orders", label: "My Orders", icon: ShoppingBag },
      { href: "/dashboard/user/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/user/payments", label: "Payments", icon: DollarSign },
      { href: "/dashboard/user/profile", label: "My Profile", icon: Users },
      { href: "/dashboard/user/settings", label: "Settings", icon: Settings },
    ],
    TAILOR: [
      { href: "/dashboard/tailor", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/tailor/orders", label: "Orders", icon: Scissors },
      { href: "/dashboard/tailor/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/tailor/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/tailor/profile", label: "Profile", icon: Users },
      { href: "/dashboard/tailor/settings", label: "Settings", icon: Settings },
    ],
    SHOPKEEPER: [
      { href: "/dashboard/shopkeeper", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/shopkeeper/products", label: "Products", icon: Package },
      { href: "/dashboard/shopkeeper/products/new", label: "Add Product", icon: PlusCircle },
      { href: "/dashboard/shopkeeper/orders", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/shopkeeper/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/shopkeeper/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/shopkeeper/settings", label: "Settings", icon: Settings },
    ],
    DELIVERY: [
      { href: "/dashboard/delivery", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/delivery/deliveries", label: "Deliveries", icon: Truck },
      { href: "/dashboard/delivery/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/delivery/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/delivery/profile", label: "Profile", icon: Users },
      { href: "/dashboard/delivery/settings", label: "Settings", icon: Settings },
    ],
    ADMIN: [
      { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/admin/users", label: "Users", icon: Users },
      { href: "/dashboard/admin/shops", label: "Shops", icon: Package },
      { href: "/dashboard/admin/tailors", label: "Tailors", icon: Scissors },
      { href: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/admin/payments", label: "Payments", icon: DollarSign },
      { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    ],
  };


  const currentLinks = links[role] || [];
  const activeClass = roleAccents[role] || "text-gray-900 bg-gray-100 border-gray-200";

  return (
    <>
      <aside
        className={cn(
          "w-64 flex flex-col border-r border-gray-200/50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl h-full",
          "md:w-64 md:flex-shrink-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-lg overflow-hidden transition-transform group-hover:scale-105">
              <span className="font-serif font-bold text-lg relative z-10">S</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white leading-none tracking-tight">StyleGenie</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{role}</span>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-none">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard/" + role.toLowerCase() && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group overflow-hidden border",
                  isActive
                    ? activeClass + " shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border-transparent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-current opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-200 relative z-10", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="truncate relative z-10">{link.label}</span>

                {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50 relative z-10" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="h-4 w-4 opacity-70" />
            <span>Home Website</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 h-10 px-3 font-medium rounded-xl transition-colors"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}

