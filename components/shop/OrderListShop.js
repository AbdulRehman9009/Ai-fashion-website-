"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Scissors, User, Star, MapPin, Phone, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import Link from "next/link";
import { getProductImage, useProductImageFallback } from "@/lib/productImages";
import AssignDeliveryDialog from "@/components/tailor/AssignDeliveryDialog";

export default function OrderListShop() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tailors, setTailors] = useState([]);
    const [tailorsLoading, setTailorsLoading] = useState(false);
    const [selectedTailor, setSelectedTailor] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [deliveryDialogOrder, setDeliveryDialogOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch tailors when dialog opens
    useEffect(() => {
        if (selectedOrder) {
            fetchTailors();
        }
    }, [selectedOrder]);

    async function fetchOrders() {
        try {
            const res = await axios.get("/api/orders?role=SHOPKEEPER");
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }

    async function fetchTailors() {
        setTailorsLoading(true);
        try {
            // Fetch real tailors from API with availability filter
            const res = await axios.get("/api/tailors?available=true");
            setTailors(res.data);

            if (res.data.length === 0) {
                toast.info("No tailors available at the moment");
            }
        } catch (error) {
            console.error("Failed to fetch tailors", error);
            toast.error("Failed to load tailors");
            setTailors([]);
        } finally {
            setTailorsLoading(false);
        }
    }

    async function handleStatusUpdate(orderId, status) {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
        setActionLoading(true);
        try {
            await axios.patch(`/api/orders/${orderId}/status`, { status });
            toast.success(`Order ${status}`);
            fetchOrders();
        } catch (e) {
            toast.error(e.response?.data?.error || "Failed to update");
        } finally {
            setActionLoading(false);
        }
    }

    async function assignTailor() {
        if (!selectedTailor) return toast.error("Select a tailor");
        setActionLoading(true);
        try {
            await axios.patch(`/api/orders/${selectedOrder._id}/tailor`, { tailorId: selectedTailor });
            toast.success("Tailor assigned successfully!");
            setSelectedOrder(null);
            setSelectedTailor("");
            fetchOrders();
        } catch (e) {
            toast.error(e.response?.data?.error || "Failed to assign tailor");
        } finally {
            setActionLoading(false);
        }
    }

    // Check if order requires tailoring (unstitched product or tailoring requests)
    const requiresTailoring = (order) => {
        if (order.tailoringRequests?.length > 0) return true;
        // Check if any product is unstitched
        const hasUnstitched = order.items?.some(item =>
            item.product?.type === "UNSTITCHED"
        );
        return hasUnstitched;
    };

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-orange-600 h-8 w-8" />
                <span className="text-gray-500">Loading orders...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with link to tailors page */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shop Orders</h3>
                <Link href="/dashboard/shopkeeper/tailors">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Scissors className="h-4 w-4" />
                        Browse Tailors
                    </Button>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500">No orders yet.</p>
                </div>
            ) : null}

            <div className="grid gap-4">
                {orders.map(o => (
                    <Card key={o._id} className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={getProductImage(o.items?.[0]?.product)}
                                            className="h-full w-full object-cover"
                                            alt={o.items?.[0]?.product?.title || "Order item"}
                                            onError={useProductImageFallback}
                                        />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Order #{String(o._id).slice(-6).toUpperCase()}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {o.user?.name || o.user?.email || "Guest Customer"}
                                        </CardDescription>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {o.urgent && (
                                                <Badge variant="destructive" className="text-xs">
                                                    URGENT
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="text-xs">{o.status}</Badge>
                                            <Badge className={`text-xs ${o.paymentStatus === "PAID"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}>
                                                {o.paymentStatus}
                                            </Badge>
                                            {requiresTailoring(o) && (
                                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                                                    <Scissors className="h-3 w-3 mr-1" />
                                                    Tailoring Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-xl text-gray-900 dark:text-white">
                                        ${o.pricing?.grandTotal?.toFixed(2) || "0.00"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(o.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-wrap justify-end gap-2 pt-0">
                            {(o.status === "OrderCreated" || o.status === "PaymentPending") && (
                                <>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(o._id, "Canceled")} disabled={actionLoading}>
                                        <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(o._id, "PaymentConfirmed")} disabled={actionLoading}>
                                        <Check className="h-4 w-4 mr-1" /> Confirm Order
                                    </Button>
                                </>
                            )}

                            {o.status === "PaymentConfirmed" && requiresTailoring(o) && (
                                <Button size="sm" variant="outline" onClick={() => { setSelectedOrder(o); setSelectedTailor(""); }} className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                                    <Scissors className="h-4 w-4" /> Assign Tailor
                                </Button>
                            )}
                            {o.status === "PaymentConfirmed" && !requiresTailoring(o) && !o.delivery && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5" onClick={() => setDeliveryDialogOrder(o)}>
                                    <Truck className="h-4 w-4" /> Assign Delivery
                                </Button>
                            )}
                            {o.status === "TailoringCompleted" && !o.delivery && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5" onClick={() => setDeliveryDialogOrder(o)}>
                                    <Truck className="h-4 w-4" /> Assign Delivery
                                </Button>
                            )}
                            {o.delivery && (
                                <Badge variant="secondary" className="text-xs gap-1.5">
                                    <Truck className="h-3.5 w-3.5 text-blue-600" /> Courier Assigned
                                </Badge>
                            )}
                            {o.assignedTailor && (
                                <Badge variant="secondary" className="text-xs">
                                    Tailor Assigned
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tailor Assignment Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Scissors className="h-5 w-5 text-purple-600" />
                            Assign Tailor
                        </DialogTitle>
                        <DialogDescription>
                            Select a tailor for Order #{String(selectedOrder?._id).slice(-6).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {tailorsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
                                <span className="ml-2 text-gray-500">Loading available tailors...</span>
                            </div>
                        ) : tailors.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <Scissors className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">No available tailors found.</p>
                                <Link href="/dashboard/shopkeeper/tailors" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
                                    Browse all tailors →
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label className="font-medium">Select a Tailor</Label>
                                    <Select onValueChange={setSelectedTailor} value={selectedTailor}>
                                        <SelectTrigger className="h-auto py-2">
                                            <SelectValue placeholder="Choose a tailor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tailors.map(t => (
                                                <SelectItem key={t._id} value={t._id} className="py-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={t.image} />
                                                            <AvatarFallback className="bg-purple-100 text-purple-700">
                                                                {t.name?.charAt(0) || "T"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <span className="font-medium">{t.name || t.email}</span>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                {t.tailorProfile?.ratingAvg > 0 && (
                                                                    <span className="flex items-center gap-0.5">
                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                        {t.tailorProfile.ratingAvg.toFixed(1)}
                                                                    </span>
                                                                )}
                                                                {t.tailorProfile?.location?.city && (
                                                                    <span className="flex items-center gap-0.5">
                                                                        <MapPin className="h-3 w-3" />
                                                                        {t.tailorProfile.location.city}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Selected Tailor Details */}
                                {selectedTailor && (
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        {(() => {
                                            const tailor = tailors.find(t => t._id === selectedTailor);
                                            if (!tailor) return null;
                                            return (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={tailor.image} />
                                                            <AvatarFallback className="bg-purple-200 text-purple-800">
                                                                {tailor.name?.charAt(0) || "T"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="font-semibold">{tailor.name}</h4>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                {tailor.tailorProfile?.ratingAvg > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                        {tailor.tailorProfile.ratingAvg.toFixed(1)}
                                                                        <span className="text-gray-400">({tailor.tailorProfile.ratingCount || 0} reviews)</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {tailor.tailorProfile?.specialization?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {tailor.tailorProfile.specialization.map((spec, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {spec}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {tailor.tailorProfile?.pricePerJob && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Fee: <span className="font-semibold text-green-600">${tailor.tailorProfile.pricePerJob}</span>/job
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                <Button
                                    onClick={assignTailor}
                                    disabled={actionLoading || !selectedTailor}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Confirm Assignment
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Assign Delivery Dialog */}
            <AssignDeliveryDialog
                open={!!deliveryDialogOrder}
                onOpenChange={(open) => !open && setDeliveryDialogOrder(null)}
                order={deliveryDialogOrder}
                onSuccess={() => {
                    setDeliveryDialogOrder(null);
                    fetchOrders();
                }}
            />
        </div>
    );
}
