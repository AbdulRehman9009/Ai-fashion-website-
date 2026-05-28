"use client";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Package, CheckCircle, Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function DeliveryOrderCard({ delivery, onUpdate }) {
    const [notes, setNotes] = useState(delivery.deliveryNotes || "");
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(delivery.status);

    const statusColors = {
        Assigned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        OutForPickup: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        PickedUp: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        OutForDelivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };

    const statusOptions = [
        { value: "Assigned", label: "Assigned", icon: Clock },
        { value: "OutForPickup", label: "Out for Pickup", icon: Truck },
        { value: "PickedUp", label: "Picked Up", icon: Package },
        { value: "OutForDelivery", label: "Out for Delivery", icon: Truck },
        { value: "Delivered", label: "Delivered", icon: CheckCircle },
    ];

    const handleStatusUpdate = async (newStatus) => {
        if (newStatus === delivery.status) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/deliveries/${delivery._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, notes }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            const statusMessages = {
                PickedUp: "Delivery marked as picked up",
                OutForDelivery: "Package is now out for delivery",
                Delivered: "Outfit delivered successfully! 🎉",
            };

            toast.success(statusMessages[newStatus] || "Status updated successfully");
            setSelectedStatus(newStatus);
            onUpdate();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNotesUpdate = async () => {
        if (notes === delivery.deliveryNotes) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/deliveries/${delivery._id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });

            if (!res.ok) throw new Error("Failed to update notes");
            toast.success("Notes saved");
            onUpdate();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isDelivered = delivery.status === "Delivered";

    return (
        <Card className={cn(
            "overflow-hidden border-l-4 shadow-md transition-all hover:shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
            isDelivered ? "border-l-green-500 opacity-75" : "border-l-green-500"
        )}>
            <CardHeader className="p-4 bg-gradient-to-r from-green-50 to-white dark:from-green-950/30 dark:to-gray-900">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        
                        <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
                            {delivery.customer?.image ? (
                                <img src={delivery.customer.image} alt="Customer" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-7 w-7 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{delivery.customer?.name || "Customer"}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>Order #{String(delivery.orderId).slice(-6)}</span>
                                {delivery.urgent && (
                                    <Badge variant="destructive" className="bg-red-500 animate-pulse text-xs">
                                        URGENT +$10
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Badge className={cn("capitalize", statusColors[delivery.status] || "bg-gray-100")}>
                        {delivery.status.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 grid md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                    
                    <div className="flex gap-4">
                        <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                            {delivery.outfitImage ? (
                                <img src={delivery.outfitImage} className="h-full w-full object-cover" alt="Outfit" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                    <Package className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Outfit Details</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Event: {delivery.eventType}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Shop: {delivery.shop?.name}</p>
                            <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {delivery.paymentStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    
                    <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900 dark:text-white">Delivery Address:</p>
                                <p className="text-gray-600 dark:text-gray-300">{delivery.deliveryAddress?.name || delivery.customer?.name}</p>
                                <p className="text-gray-600 dark:text-gray-300">{delivery.deliveryAddress?.street}</p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.state} {delivery.deliveryAddress?.zip}
                                </p>
                                {delivery.deliveryAddress?.phone && (
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{delivery.deliveryAddress.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="space-y-4 border-l border-gray-200 dark:border-gray-800 pl-4 md:pl-6">
                    {!isDelivered ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Update Status</label>
                                <Select value={selectedStatus} onValueChange={handleStatusUpdate} disabled={loading}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4" />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Delivery Notes</label>
                                <Textarea
                                    placeholder="Add any delivery notes (optional)..."
                                    className="h-20 text-sm"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    onBlur={handleNotesUpdate}
                                    disabled={loading}
                                />
                            </div>

                            {delivery.status !== "Delivered" && (
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => handleStatusUpdate("Delivered")}
                                    disabled={loading}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Delivered
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="font-semibold text-green-700 dark:text-green-300">Delivery Completed</p>
                            {delivery.confirmedAt && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(delivery.confirmedAt).toLocaleString()}
                                </p>
                            )}
                            {delivery.deliveryNotes && (
                                <div className="mt-4 text-left bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.deliveryNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                            <span className="font-bold text-green-600">${delivery.fee || 10}</span>
                        </div>
                        {delivery.urgentBonus > 0 && (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Urgent Bonus:</span>
                                <span className="font-bold text-orange-600">+${delivery.urgentBonus}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
