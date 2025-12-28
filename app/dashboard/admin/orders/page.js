"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    ShoppingBag, Search, Filter, Calendar, DollarSign, User,
    Loader2, Package, CheckCircle, Clock, Truck, AlertCircle, XCircle
} from "lucide-react";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function OrderMonitoringPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");

    const statusConfig = {
        OrderCreated: { label: "Created", icon: Package, color: "bg-blue-100 text-blue-800" },
        PaymentPending: { label: "Payment Pending", icon: DollarSign, color: "bg-yellow-100 text-yellow-800" },
        TailoringPending: { label: "Tailoring Pending", icon: Clock, color: "bg-purple-100 text-purple-800" },
        InProgress: { label: "In Progress", icon: Package, color: "bg-orange-100 text-orange-800" },
        ReadyForPickup: { label: "Ready for Pickup", icon: CheckCircle, color: "bg-green-100 text-green-800" },
        DeliveryPending: { label: "Delivery Pending", icon: Truck, color: "bg-indigo-100 text-indigo-800" },
        OutForDelivery: { label: "Out for Delivery", icon: Truck, color: "bg-blue-100 text-blue-800" },
        Completed: { label: "Completed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
        Cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800" }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, paymentFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (paymentFilter !== "ALL") params.append("paymentStatus", paymentFilter);

            const res = await fetch(`/api/admin/orders?${params}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                toast.error("Failed to load orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Could not load orders");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const OrderCard = ({ order }) => {
        const config = statusConfig[order.status] || statusConfig.OrderCreated;
        const StatusIcon = config.icon;
        const hasPaymentIssue = order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED";

        return (
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-lg">Order #{order._id?.slice(-8)}</h3>
                                    <Badge className={config.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {config.label}
                                    </Badge>
                                    {hasPaymentIssue && (
                                        <Badge variant="destructive">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {order.paymentStatus}
                                        </Badge>
                                    )}
                                    {order.paymentStatus === "PAID" && (
                                        <Badge className="bg-green-100 text-green-800">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            Paid
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Created {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                    ${order.pricing?.grandTotal || 0}
                                </p>
                            </div>
                        </div>

                        {/* Customer & Shop Info */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Customer</p>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-sm">{order.user?.name || "Unknown"}</p>
                                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Shop</p>
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-orange-500" />
                                    <p className="font-medium text-sm">{order.shop?.name || "Unknown"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tailor Info (if assigned) */}
                        {order.assignedTailor && (
                            <div className="pt-2 border-t">
                                <p className="text-xs text-gray-500 mb-1">Assigned Tailor</p>
                                <p className="font-medium text-sm">{order.assignedTailor.name}</p>
                            </div>
                        )}

                        {/* Timeline */}
                        {order.timeline && order.timeline.length > 0 && (
                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500 mb-3">Order Timeline</p>
                                <div className="space-y-2">
                                    {order.timeline.slice(-3).map((event, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs">
                                            <Calendar className="h-3 w-3 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium">{event.status}</p>
                                                <p className="text-gray-500">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing Breakdown */}
                        {order.pricing && (
                            <div className="pt-4 border-t">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Item Price:</span>
                                        <span className="font-medium">${order.pricing.itemPrice || 0}</span>
                                    </div>
                                    {order.pricing.tailoringFee > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tailoring:</span>
                                            <span className="font-medium">${order.pricing.tailoringFee}</span>
                                        </div>
                                    )}
                                    {order.pricing.deliveryFee > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery:</span>
                                            <span className="font-medium">${order.pricing.deliveryFee}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Calculate stats
    const pendingPayments = orders.filter(o => o.paymentStatus === "PENDING" || o.paymentStatus === "FAILED").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);
    const completedOrders = orders.filter(o => o.status === "Completed").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Order Monitoring</h2>
                    <p className="text-gray-500">Track and manage all orders across the platform</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedOrders}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-red-700">Payment Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingPayments}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by customer, shop, or order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="OrderCreated">Created</SelectItem>
                                <SelectItem value="PaymentPending">Payment Pending</SelectItem>
                                <SelectItem value="TailoringPending">Tailoring Pending</SelectItem>
                                <SelectItem value="InProgress">In Progress</SelectItem>
                                <SelectItem value="DeliveryPending">Delivery Pending</SelectItem>
                                <SelectItem value="OutForDelivery">Out for Delivery</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Payment Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        No orders found
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
