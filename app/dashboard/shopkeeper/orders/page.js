"use client";
import { Suspense } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import OrderListShop from "@/components/shop/OrderListShop";

export default function ShopkeeperOrdersPage() {
    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                    <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Orders
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage and fulfil customer orders for your shop.
                    </p>
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                }
            >
                <OrderListShop />
            </Suspense>
        </div>
    );
}
