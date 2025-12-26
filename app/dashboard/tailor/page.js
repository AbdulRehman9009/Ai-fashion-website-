"use client";
import OrdersList from "@/components/OrdersList";

export default function TailorDashboard() {
  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold tracking-tight">Tailoring Assignments</h2>
         <p className="text-gray-500">Manage your stitching tasks and update status.</p>
      </div>
      <OrdersList role="TAILOR" />
    </div>
  );
}
