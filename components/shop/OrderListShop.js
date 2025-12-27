"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Scissors, User } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function OrderListShop() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tailors, setTailors] = useState([]);
    const [selectedTailor, setSelectedTailor] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchTailors();
    }, []);

    async function fetchOrders() {
        try {
            const res = await fetch("/api/orders?role=SHOPKEEPER");
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    }

    // Assuming we have an API to get list of tailors
    async function fetchTailors() {
        // Mocking tailor list purely for UI, assume GET /api/users?role=TAILOR exists or similar
        // For now, hardcode or fetch real if possible. Implementation plan noted needing a way.
        // Let's assume a dedicated endpoint or filtered user list.
        // Using a mock for now to proceed, will verify if users exist.
        try {
            // const res = await fetch("/api/users?role=TAILOR");
            // const data = await res.json();
            // if(res.ok) setTailors(data);
            setTailors([
                { _id: "mock1", name: "Tailor John" },
                { _id: "mock2", name: "Tailor Mary" }
            ]);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleStatusUpdate(orderId, status) {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success(`Order ${status}`);
                fetchOrders();
            } else {
                throw new Error("Failed to update");
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    }

    async function assignTailor() {
        if (!selectedTailor) return toast.error("Select a tailor");
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${selectedOrder._id}/tailor`, {
                method: "PATCH", // Special route for assigning
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tailorId: selectedTailor })
            });
            if (res.ok) {
                toast.success("Tailor assigned");
                setSelectedOrder(null);
                fetchOrders();
            } else {
                throw new Error("Failed to assign");
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="space-y-4">
            {orders.length === 0 ? <p className="text-gray-500 text-center py-10">No active orders.</p> : null}

            <div className="grid gap-4">
                {orders.map(o => (
                    <Card key={o._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                                        {o.items?.[0]?.product?.imageUrl && <img src={o.items[0].product.imageUrl} className="h-full w-full object-cover" />}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Order #{String(o._id).slice(-4)}</CardTitle>
                                        <CardDescription>
                                            Customer: {o.user?.name || "Guest"}
                                        </CardDescription>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={o.urgent ? "destructive" : "secondary"}>
                                                {o.urgent ? "URGENT" : "Standard"}
                                            </Badge>
                                            <Badge variant="outline">{o.status}</Badge>
                                            <Badge className={o.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                                {o.paymentStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-xl">${o.pricing?.grandTotal}</span>
                                    <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-2 pt-0">
                            {o.status === "OrderCreated" && (
                                <>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(o._id, "Canceled")}>
                                        Reject
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(o._id, "PaymentConfirmed")}>
                                        Accept & Confirm Payment
                                    </Button>
                                </>
                            )}
                            {o.status === "PaymentConfirmed" && ( // Ready for Tailoring
                                <Button size="sm" variant="outline" onClick={() => { setSelectedOrder(o); setSelectedTailor(""); }}>
                                    <Scissors className="h-4 w-4 mr-2" /> Assign Tailor
                                </Button>
                            )}
                            {o.status === "TailoringCompleted" && ( // Ready for Pickup/Delivery
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(o._id, "DeliveryPending")}>
                                    Mark Ready for Delivery
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Tailor to Order #{String(selectedOrder?._id).slice(-4)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Tailor</Label>
                            <Select onValueChange={setSelectedTailor} value={selectedTailor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a tailor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tailors.map(t => (
                                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={assignTailor} disabled={actionLoading || !selectedTailor} className="w-full">
                            {actionLoading ? <Loader2 className="animate-spin" /> : "Confirm Assignment"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
