"use client";
import OrdersList from "@/components/OrdersList";

export default function ShopkeeperDashboard() {
  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold tracking-tight">Shop Overview</h2>
         <p className="text-gray-500">Manage products and track new orders.</p>
      </div>
      <OrdersList role="SHOPKEEPER" />
    </div>
  );
}
