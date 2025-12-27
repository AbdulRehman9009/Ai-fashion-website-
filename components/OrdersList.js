"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, RefreshCw, X, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import OrderTimeline from "@/components/OrderTimeline";

export default function OrdersList({ role, limit, compact }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      // Logic to support limit for dashboard summary
      let url = `/api/orders?role=${role}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      let fetchedOrders = Array.isArray(data) ? data : [];
      if (limit) fetchedOrders = fetchedOrders.slice(0, limit);

      setOrders(fetchedOrders);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [role, limit]);

  async function pay(orderId) {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const data = await res.json();

      if (res.ok) {
        toast.success("Payment simulated successfully!");
        await fetchOrders();
      } else {
        throw new Error(data.error || "Payment failed");
      }
    } catch (e) {
      toast.error(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) toast.success(`Order status updated to ${status}`);
      else toast.error("Update failed");
      await fetchOrders();
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED": return "bg-blue-100 text-blue-800";
      case "STITCHING": return "bg-purple-100 text-purple-800";
      case "READY_FOR_DELIVERY": return "bg-teal-100 text-teal-800";
      case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card className={compact ? "border-0 shadow-none" : ""}>
        {!compact && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage and track your orders here.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </CardHeader>
        )}
        <CardContent className={compact ? "p-0" : ""}>
          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}

          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-xl hover:bg-gray-50 transition-all gap-4 shadow-sm hover:shadow-md cursor-pointer" onClick={() => setSelectedOrder(o)}>
                <div className="flex gap-4 items-center flex-1">
                  {/* Product Image */}
                  <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {(o.items?.[0]?.product?.imageUrl) ? (
                      <img src={o.items[0].product.imageUrl} alt="Product" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-medium">No Img</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">#{String(o._id).slice(-4).toUpperCase()}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${getStatusColor(o.status)}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      {o.urgent && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-red-500 text-white animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>

                    {/* User Info for non-users */}
                    {role !== "USER" && o.user && (
                      <div className="text-sm font-medium text-gray-700">
                        Customer: {o.user.name || o.user.email}
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      {(o.items || []).length} items • <span className="font-medium text-gray-900">${(o.totalAmount || o.pricing?.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>


                <div className="flex gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  {role === "USER" && o.paymentStatus === "PENDING" && (
                    <Button size="sm" onClick={() => pay(o._id)} className="bg-black text-white hover:bg-gray-800 h-8 text-xs">Pay Now</Button>
                  )}
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelectedOrder(o)}>Details</Button>
                </div>
              </div>
            ))}
            {orders.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <p>No orders yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center text-2xl">
              Order #{selectedOrder ? String(selectedOrder._id).slice(-6).toUpperCase() : ""}
            </DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Order Timeline</h4>
                  <OrderTimeline status={selectedOrder.status} />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Shipping Address</h4>
                  <div className="flex items-start text-sm text-gray-600 gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                          {item.product?.imageUrl && <img src={item.product.imageUrl} className="h-full w-full object-cover" />}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{item.product?.name || "Product"}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Status</span>
                    <span className={`font-bold ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${selectedOrder.totalAmount || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
