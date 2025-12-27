"use client";
import OrdersList from "@/components/OrdersList";

export default function OrderHistoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
                <p className="text-gray-500">View and track all your past and current orders.</p>
            </div>
            <OrdersList role="USER" />
        </div>
    );
}
