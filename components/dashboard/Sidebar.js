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
  Store,
  BarChart3,
  PlusCircle,
  Home,
  Heart,
  Shield,
  DollarSign,
  ClipboardList,
  MapPin,
  TrendingUp,
  Calendar,
  Award
} from "lucide-react";

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const roleColors = {
    USER: "from-blue-500 to-blue-600",
    TAILOR: "from-purple-500 to-purple-600",
    SHOPKEEPER: "from-orange-500 to-orange-600",
    DELIVERY: "from-green-500 to-green-600",
    ADMIN: "from-red-600 to-red-700"
  };

  const links = {
    USER: [
      { href: "/dashboard/user", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/user/orders", label: "My Orders", icon: ShoppingBag },
      { href: "/dashboard/user/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/user/payments", label: "Payments", icon: DollarSign },
      { href: "/dashboard/user/profile", label: "My Profile", icon: Users },
      { href: "/dashboard/user/settings", label: "Settings", icon: Settings },
    ],
    TAILOR: [
      { href: "/dashboard/tailor", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/tailor", label: "Orders", icon: Scissors },
      { href: "/dashboard/tailor/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/tailor/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/tailor/profile", label: "My Profile", icon: Users },
      { href: "/dashboard/tailor/settings", label: "Settings", icon: Settings },
    ],
    SHOPKEEPER: [
      { href: "/dashboard/shopkeeper", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/shopkeeper/products", label: "Products", icon: Package },
      { href: "/dashboard/shopkeeper/products/new", label: "Add Product", icon: PlusCircle },
      { href: "/dashboard/shopkeeper", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/shopkeeper/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/shopkeeper/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/shopkeeper/settings", label: "Settings", icon: Settings },
    ],
    DELIVERY: [
      { href: "/dashboard/delivery", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/delivery", label: "Deliveries", icon: Truck },
      { href: "/dashboard/delivery/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/delivery/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/delivery/profile", label: "My Profile", icon: Users },
      { href: "/dashboard/delivery/settings", label: "Settings", icon: Settings },
    ],
    ADMIN: [
      { href: "/dashboard/admin", label: "Dashboard", icon: Shield },
      { href: "/dashboard/admin/users", label: "Users", icon: Users },
      { href: "/dashboard/admin/shops", label: "Shops", icon: Store },
      { href: "/dashboard/admin/tailors", label: "Tailors", icon: Scissors },
      { href: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/admin/payments", label: "Payments", icon: DollarSign },
      { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    ]
  };

  const currentLinks = links[role] || [];
  const colorGradient = roleColors[role] || "from-gray-700 to-gray-800";

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white shadow-lg transition-all duration-300 ease-in-out">
      {/* Brand Header */}
      <div className={`p-6 border-b bg-gradient-to-r ${colorGradient}`}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
            S
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">StyleAI</h2>
            <p className="text-xs font-medium text-white/80">{role} Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href.includes('?') && pathname.includes(link.href.split('?')[0]));

          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
                "hover:bg-gray-100 hover:translate-x-1 hover:shadow-sm",
                isActive
                  ? `bg-gradient-to-r ${colorGradient} text-white shadow-md`
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions Section */}
      <div className="px-3 py-2 border-t bg-gray-50/50">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t bg-gray-50">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:shadow-sm"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
