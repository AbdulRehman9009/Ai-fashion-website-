"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";
import Link from "next/link";


export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                setOrder(data.error ? null : data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>;
    if (!order) return <div className="text-center p-12 text-red-500">Order not found.</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/user/orders">
                    <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Order #{String(order._id).slice(-6)}</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                        <Package className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.product?.title || "Product"}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.unitPrice}</p>
                                    </div>
                                    <p className="font-bold">${item.totalPrice}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping & Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Shipping Address</p>
                                <p>{order.shippingAddress?.street}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Payment Status</p>
                                <p className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {order.paymentStatus}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Status */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                            <CardDescription>Current stage of your order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderTimeline timeline={order.timeline} status={order.status} />
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${order.pricing?.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Items Total</span>
                                <span>${order.pricing?.itemsTotal?.toFixed(2)}</span>
                            </div>
                            {order.pricing?.tailoringTotal > 0 && (
                                <div className="flex justify-between text-sm text-purple-600">
                                    <span>Tailoring</span>
                                    <span>+${order.pricing?.tailoringTotal?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Delivery</span>
                                <span>+${order.pricing?.deliveryFee?.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${order.pricing?.grandTotal?.toFixed(2)}</span>
                            </div>

                            {order.paymentStatus !== "PAID" ? (
                                <div className="pt-4 text-center p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 rounded-xl border border-orange-200 dark:border-orange-900 text-sm font-medium">
                                    Cash on Delivery — Please prepare ${order.pricing?.grandTotal?.toFixed(2)} to pay when your package arrives.
                                </div>
                            ) : (
                                <div className="pt-4 text-center p-4 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-900 text-sm font-medium">
                                    Payment Completed on Delivery.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
