"use client";
import { useState, useEffect } from "react";
import { Scissors, Truck, CheckCircle, Loader2, Clock } from "lucide-react";
import OrderCard from "@/components/ui/OrderCard";
import AssignDeliveryDialog from "@/components/tailor/AssignDeliveryDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function TailorOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deliveryDialogOrder, setDeliveryDialogOrder] = useState(null);
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const fetchOrders = async () => {
        try {
            const res = await axios.get("/api/orders?role=TAILOR");
            const sorted = res.data.sort((a, b) => {
                if (a.urgent === b.urgent) return new Date(b.createdAt) - new Date(a.createdAt);
                return a.urgent ? -1 : 1;
            });
            setOrders(sorted);
        } catch (e) {
            console.error(e);
            toast.error("Could not load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAction = async (orderId, action) => {
        setActionLoading(orderId);
        try {
            if (action === "accept") {
                await axios.patch(`/api/orders/${orderId}/tailor`, { action: "accept" });
            } else if (action === "mark_stitched") {
                await axios.patch(`/api/orders/${orderId}/status`, { status: "TailoringCompleted" });
            }
            toast.success(action === "accept" ? "Job accepted!" : "Marked as stitched!");
            fetchOrders();
        } catch (e) {
            toast.error(e.response?.data?.error || "Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredOrders = orders.filter(o => {
        const query = searchQuery.toLowerCase();
        return !searchQuery ||
            String(o._id).toLowerCase().includes(query) ||
            o.user?.name?.toLowerCase().includes(query) ||
            o.user?.email?.toLowerCase().includes(query) ||
            o.status?.toLowerCase().includes(query) ||
            o.items?.some(item => item.product?.title?.toLowerCase().includes(query));
    });

    const ACTIVE_STATUSES = ["TailoringPending", "TailoringInProgress", "placed"];
    const READY_STATUSES = ["TailoringCompleted"];
    const HISTORY_STATUSES = ["DeliveryPending", "Completed", "Delivered", "stitched"];

    const activeOrders = filteredOrders.filter(o => ACTIVE_STATUSES.includes(o.status));
    const readyOrders = filteredOrders.filter(o => READY_STATUSES.includes(o.status));
    const historyOrders = filteredOrders.filter(o => HISTORY_STATUSES.includes(o.status));

    const EmptyState = ({ icon: Icon, label }) => (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Icon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <Scissors className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        My Orders
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        All your stitching jobs in one place.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 rounded-xl h-12 w-auto inline-flex">
                    <TabsTrigger value="active" className="rounded-lg px-5 h-10">
                        Active Jobs
                        {activeOrders.length > 0 && (
                            <Badge className="ml-2 bg-purple-100 text-purple-700 border-0">{activeOrders.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="delivery" className="rounded-lg px-5 h-10">
                        Assign Delivery
                        {readyOrders.length > 0 && (
                            <Badge className="ml-2 bg-orange-100 text-orange-700 border-0">{readyOrders.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-5 h-10">History</TabsTrigger>
                </TabsList>

                {/* Active */}
                <TabsContent value="active" className="mt-0">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
                    ) : activeOrders.length === 0 ? (
                        <EmptyState icon={Scissors} label="No active stitching jobs" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeOrders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    actions={
                                        order.tailorAcceptanceStatus === "Pending" ? (
                                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full"
                                                disabled={actionLoading === order._id}
                                                onClick={() => handleAction(order._id, "accept")}>
                                                {actionLoading === order._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Accept Job
                                            </Button>
                                        ) : (
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full"
                                                disabled={actionLoading === order._id}
                                                onClick={() => handleAction(order._id, "mark_stitched")}>
                                                <CheckCircle className="h-4 w-4 mr-2" /> Mark Stitched
                                            </Button>
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Assign Delivery */}
                <TabsContent value="delivery" className="mt-0">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
                    ) : readyOrders.length === 0 ? (
                        <EmptyState icon={Truck} label="No orders ready for delivery" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {readyOrders.map(order => (
                                <OrderCard key={order._id} order={order}
                                    actions={
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full gap-2"
                                            onClick={() => setDeliveryDialogOrder(order)}>
                                            <Truck className="h-4 w-4" /> Assign Delivery
                                        </Button>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* History */}
                <TabsContent value="history" className="mt-0">
                    {historyOrders.length === 0 ? (
                        <EmptyState icon={Clock} label="No completed orders yet" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {historyOrders.map(o => <OrderCard key={o._id} order={o} />)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <AssignDeliveryDialog
                open={!!deliveryDialogOrder}
                onOpenChange={(open) => !open && setDeliveryDialogOrder(null)}
                order={deliveryDialogOrder}
                onSuccess={fetchOrders}
            />
        </div>
    );
}
