"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartSidebar from "@/components/cart/CartSidebar";

export default function CartGlobalButton() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const { cartCount } = useCart();

    const isCustomer = session?.user?.role === "USER";
    const isAuth = pathname?.startsWith("/auth");
    const isCheckout = pathname?.startsWith("/checkout");
    const shouldShow = isCustomer && !isAuth && !isCheckout && (
        pathname?.startsWith("/dashboard/user") ||
        pathname?.startsWith("/shops") ||
        pathname?.startsWith("/products")
    );

    if (!shouldShow) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-black/30 ring-1 ring-white/20 transition hover:scale-105 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                aria-label="Open cart"
            >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-950">
                        {cartCount > 9 ? "9+" : cartCount}
                    </span>
                )}
            </button>
            <CartSidebar isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
