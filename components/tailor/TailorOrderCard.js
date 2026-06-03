"use client";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { User, Shirt, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { getProductImage, useProductImageFallback } from "@/lib/productImages";

export default function TailorOrderCard({ order, onUpdate }) {
    const [notes, setNotes] = useState(order.tailorNotes || "");
    const [date, setDate] = useState(order.estimatedCompletionDate ? new Date(order.estimatedCompletionDate) : null);
    const [loading, setLoading] = useState(false);

    // Status colors
    const statusColors = {
        TailoringPending: "bg-orange-100 text-orange-800",
        TailoringInProgress: "bg-blue-100 text-blue-800",
        TailoringCompleted: "bg-green-100 text-green-800",
    };

    const handleAction = async (action, payload = {}) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${order._id}/tailor`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload })
            });

            if (!res.ok) throw new Error("Action failed");

            toast.success("Order updated successfully");
            onUpdate();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const isPendingAcceptance = order.tailorAcceptanceStatus === "Pending";
    const isInProgress = order.status === "TailoringInProgress";

    return (
        <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="p-4 bg-gray-50 flex flex-row justify-between items-start">
                <div className="flex gap-4">
                    {/* User Avatar */}
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {order.user?.image ? (
                            <img src={order.user.image} alt="User" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-6 w-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{order.user?.name || "Customer"}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Order #{String(order._id).slice(-6)}</span>
                            {order.urgent && (
                                <Badge variant="destructive" className="bg-red-500 animate-pulse">URGENT</Badge>
                            )}
                        </div>
                    </div>
                </div>
                <Badge className={cn("capitalize", statusColors[order.status] || "bg-gray-100")}>
                    {order.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
            </CardHeader>

            <CardContent className="p-4 grid md:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden border">
                            <img
                                src={getProductImage(order.items?.[0]?.product)}
                                alt={order.items?.[0]?.product?.title || "Outfit"}
                                onError={useProductImageFallback}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-medium">Outfit Details</p>
                            <p className="text-sm text-gray-500">{order.items?.length} Item(s)</p>
                            <p className="text-sm text-gray-500">Event: {order.eventType || "General"}</p>
                            <ul className="text-sm mt-1 list-disc list-inside text-gray-600">
                                {order.tailoringRequests?.map((req, i) => (
                                    <li key={i}>{req.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Workflow Actions */}
                <div className="space-y-4 border-l pl-4 md:pl-6">
                    {isPendingAcceptance ? (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-600">New Assignment</p>
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction("accept")}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Accept
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleAction("reject")}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Controls for Active Order */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">Target Date</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="border rounded px-2 py-1 text-sm w-full"
                                        value={date ? format(date, "yyyy-MM-dd") : ""}
                                        onChange={(e) => {
                                            const d = new Date(e.target.value);
                                            setDate(d);
                                            handleAction("update_date", { date: d });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-500">Notes</label>
                                <Textarea
                                    placeholder="Add measurements or notes..."
                                    className="h-20 text-sm"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    onBlur={() => handleAction("update_notes", { notes })}
                                />
                            </div>

                            <div className="pt-2">
                                {order.status === "TailoringPending" && (
                                    <Button className="w-full" onClick={() => handleAction("start_stitching")}>
                                        Start Stitching
                                    </Button>
                                )}
                                {isInProgress && (
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleAction("complete")}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
