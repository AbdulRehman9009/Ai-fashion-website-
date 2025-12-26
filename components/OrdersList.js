"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

export default function OrdersList({ role }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders?role=${role}`); // Ensure we filter by role if API supports it
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [role]);

  async function pay(orderId) {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      if(res.ok) toast.success("Payment simulated successfully!");
      else toast.error("Payment failed");
      await fetchOrders();
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
       if(res.ok) toast.success(`Order status updated to ${status}`);
       else toast.error("Update failed");
      await fetchOrders();
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PaymentPending": return "bg-yellow-100 text-yellow-800";
      case "PaymentConfirmed": return "bg-blue-100 text-blue-800";
      case "TailoringPending": return "bg-orange-100 text-orange-800";
      case "TailoringInProgress": return "bg-purple-100 text-purple-800";
      case "TailoringCompleted": return "bg-indigo-100 text-indigo-800";
      case "DeliveryPending": return "bg-gray-100 text-gray-800";
      case "OutForDelivery": return "bg-teal-100 text-teal-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage and track your orders here.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{String(o._id).slice(-6)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(o.status)}`}>
                    {o.status.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {(o.items || []).length} items • Total: <span className="font-medium text-gray-900">${o.pricing?.grandTotal?.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-400">
                   {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                {role === "USER" && o.paymentStatus === "PENDING" && (
                  <Button size="sm" onClick={() => pay(o._id)}>Pay Now</Button>
                )}
                {role === "TAILOR" && o.status === "TailoringPending" && (
                  <Button size="sm" onClick={() => updateOrderStatus(o._id, "TailoringInProgress")}>Start Stitching</Button>
                )}
                {role === "TAILOR" && o.status === "TailoringInProgress" && (
                  <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(o._id, "TailoringCompleted")}>Mark Complete</Button>
                )}
                {role === "DELIVERY" && o.status === "DeliveryPending" && (
                   <Button size="sm" onClick={() => updateOrderStatus(o._id, "OutForPickup")}>Pickup Order</Button>
                )}
                 {role === "DELIVERY" && o.status === "OutForPickup" && (
                   <Button size="sm" onClick={() => updateOrderStatus(o._id, "OutForDelivery")}>Start Delivery</Button>
                )}
                {role === "DELIVERY" && o.status === "OutForDelivery" && (
                   <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(o._id, "Delivered")}>Confirm Delivery</Button>
                )}
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            </div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No orders found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
