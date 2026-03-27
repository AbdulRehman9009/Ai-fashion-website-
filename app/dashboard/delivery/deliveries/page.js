"use client";
import { useState, useEffect } from "react";
import { Truck, Package, CheckCircle, Loader2, Clock } from "lucide-react";
import OrderCard from "@/components/ui/OrderCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import axios from "axios";

export default function DeliveryDeliveriesPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeliveries = async () => {
        try {
            const res = await axios.get("/api/deliveries");
            setDeliveries(res.data || []);
        } catch (e) {
            console.error(e);
            toast.error("Could not load deliveries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDeliveries(); }, []);

    const handleAction = async (orderId, action) => {
        try {
            const apiAction = action === "confirm" ? "confirm_delivery" : action;
            await axios.patch(`/api/orders/${orderId}/fulfillment`, { action: apiAction });
            toast.success(action === "pickup" ? "Order picked up!" : "Delivery confirmed!");
            fetchDeliveries();
        } catch (e) {
            toast.error(e.response?.data?.error || "Action failed");
        }
    };

    const ACTIVE_STATUSES = ["Assigned", "OutForPickup", "PickedUp", "OutForDelivery"];
    const activeDeliveries = deliveries.filter(d => ACTIVE_STATUSES.includes(d.status));
    const completedDeliveries = deliveries.filter(d => d.status === "Delivered");

    const EmptyState = ({ icon: Icon, label, sub }) => (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Icon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">{label}</p>
            {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        My Deliveries
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track and complete your assigned deliveries.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 rounded-xl h-12 w-auto inline-flex">
                    <TabsTrigger value="active" className="rounded-lg px-5 h-10">
                        Active
                        {activeDeliveries.length > 0 && (
                            <Badge className="ml-2 bg-blue-100 text-blue-700 border-0">{activeDeliveries.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-5 h-10">
                        Completed
                        {completedDeliveries.length > 0 && (
                            <Badge className="ml-2 bg-green-100 text-green-700 border-0">{completedDeliveries.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Active Deliveries */}
                <TabsContent value="active" className="mt-0">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : activeDeliveries.length === 0 ? (
                        <EmptyState icon={Truck} label="No active deliveries" sub="You're all caught up!" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeDeliveries.map(delivery => (
                                <OrderCard
                                    key={delivery._id}
                                    order={delivery}
                                    actions={
                                        <>
                                            {delivery.status === "Assigned" && (
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                    onClick={() => handleAction(delivery._id, "pickup")}>
                                                    <Package className="h-4 w-4" /> Pickup Order
                                                </Button>
                                            )}
                                            {["OutForPickup", "PickedUp", "OutForDelivery"].includes(delivery.status) && (
                                                <Button className="w-full bg-green-600 hover:bg-green-700 gap-2"
                                                    onClick={() => handleAction(delivery._id, "confirm")}>
                                                    <CheckCircle className="h-4 w-4" /> Confirm Delivery
                                                </Button>
                                            )}
                                        </>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* History */}
                <TabsContent value="history" className="mt-0">
                    {completedDeliveries.length === 0 ? (
                        <EmptyState icon={Clock} label="No completed deliveries yet" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedDeliveries.map(d => <OrderCard key={d._id} order={d} />)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
