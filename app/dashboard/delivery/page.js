"use client";
import OrdersList from "@/components/OrdersList";

export default function DeliveryDashboard() {
  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold tracking-tight">Delivery Tasks</h2>
         <p className="text-gray-500">View and update your delivery assignments.</p>
      </div>
      <OrdersList role="DELIVERY" />
    </div>
  );
}
