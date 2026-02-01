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
  X
} from "lucide-react";

export default function Sidebar({ role, isOpen, onClose }) {
  const pathname = usePathname();

  // Role accents for active states (text & soft background)
  const roleAccents = {
    USER: "text-blue-600 bg-blue-50 hover:bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/30",
    TAILOR: "text-purple-600 bg-purple-50 hover:bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-900/30",
    SHOPKEEPER: "text-orange-600 bg-orange-50 hover:bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30 dark:hover:bg-orange-900/30",
    DELIVERY: "text-green-600 bg-green-50 hover:bg-green-50 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/30",
    ADMIN: "text-red-600 bg-red-50 hover:bg-red-50 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/30",
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
      { href: "/dashboard/tailor", label: "Orders", icon: Scissors },
      { href: "/dashboard/tailor/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/tailor/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/tailor/profile", label: "Profile", icon: Users },
      { href: "/dashboard/tailor/settings", label: "Settings", icon: Settings },
    ],
    SHOPKEEPER: [
      { href: "/dashboard/shopkeeper", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/shopkeeper/products", label: "Products", icon: Package },
      { href: "/dashboard/shopkeeper/products/new", label: "Add Product", icon: PlusCircle },
      { href: "/dashboard/shopkeeper", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/shopkeeper/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/shopkeeper/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/shopkeeper/settings", label: "Settings", icon: Settings },
    ],
    DELIVERY: [
      { href: "/dashboard/delivery", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/delivery", label: "Deliveries", icon: Truck },
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
  const activeClass = roleAccents[role] || "text-gray-900 bg-gray-100";

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-indigo-600 text-white">
              <span className="font-serif font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white leading-none">StyleGenie</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{role}</span>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href.includes("?") && pathname.includes(link.href.split("?")[0]));

            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group",
                  isActive
                    ? activeClass
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1 bg-gray-50/30 dark:bg-gray-800/30">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="h-4 w-4 opacity-60" />
            <span>Home</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-2 px-3 font-medium"
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

