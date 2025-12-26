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
  User,
  Package
} from "lucide-react";

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const links = {
    USER: [
      { href: "/dashboard/user", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/user/orders", label: "My Orders", icon: ShoppingBag },
      // { href: "/dashboard/user/profile", label: "Profile", icon: User },
    ],
    TAILOR: [
      { href: "/dashboard/tailor", label: "Assignments", icon: Scissors },
      // { href: "/dashboard/tailor/history", label: "History", icon: LayoutDashboard },
    ],
    SHOPKEEPER: [
      { href: "/dashboard/shopkeeper", label: "Overview", icon: LayoutDashboard },
      // { href: "/dashboard/shopkeeper/products", label: "Products", icon: Package },
      // { href: "/dashboard/shopkeeper/orders", label: "Orders", icon: ShoppingBag },
    ],
    DELIVERY: [
      { href: "/dashboard/delivery", label: "Deliveries", icon: Truck },
      // { href: "/dashboard/delivery/earnings", label: "Earnings", icon: LayoutDashboard },
    ],
    ADMIN: [
      { href: "/dashboard/admin", label: "Analytics", icon: LayoutDashboard },
      // { href: "/dashboard/admin/users", label: "Users", icon: User },
    ]
  };

  const currentLinks = links[role] || [];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white shadow-sm">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">S</div>
           <div>
             <h2 className="text-xl font-bold tracking-tight">StyleAI</h2>
             <p className="text-xs font-medium text-gray-500">{role} Workspace</p>
           </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900",
                pathname === link.href ? "bg-gray-100 text-gray-900" : "text-gray-500"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t bg-gray-50">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
