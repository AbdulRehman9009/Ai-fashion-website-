"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { Package, User, Clock, AlertCircle, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generic OrderCard component for mobile-first dashboard views
 * 
 * @param {Object} order - Order object
 * @param {Function} onClick - Click handler for the card (optional)
 * @param {ReactNode} actions - Action buttons to render in footer (optional)
 * @param {boolean} showCustomer - Whether to show customer info (default: true)
 */
export default function OrderCard({
    order,
    onClick,
    actions,
    showCustomer = true,
    className
}) {
    const item = order.items?.[0] || {};
    const product = item.product || {};
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const imageSrc = product.images?.[0] || product.imageUrl || order.outfitImage;
    const customer = order.user || order.customer;
    const address = order.shippingAddress || order.deliveryAddress;

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all hover:shadow-md border-l-4",
                order.urgent ? "border-l-red-500" : "border-l-blue-500",
                className
            )}
            onClick={onClick}
        >
            <div className="flex p-4 gap-4">
                {/* Product Image */}
                <div className="h-24 w-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 relative">
                    {imageSrc ? (
                        <img src={imageSrc} alt={product.title || "Order item"} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                        </div>
                    )}
                    {order.items?.length > 1 && (
                        <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-tl">
                            +{order.items.length - 1} more
                        </div>
                    )}
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">#{String(order.orderId || order._id || order.id).slice(-6)}</span>
                                <span className="font-semibold text-sm truncate pr-2 text-gray-900 dark:text-gray-100">{product.title || "Custom Order"}</span>
                            </div>
                            <StatusBadge status={order.status} size="sm" />
                        </div>

                        {showCustomer && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <User className="h-3.5 w-3.5" />
                                <span className="truncate">{customer?.name || "Customer"}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{format(date, "MMM d, yyyy")}</span>
                        </div>
                    </div>

                    {order.urgent && (
                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium mt-2 animate-pulse">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>URGENT ORDER</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Address if relevant (e.g. for delivery) */}
            {address && (
                <div className="px-4 pb-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 border-t pt-3 mx-4 border-gray-100 dark:border-gray-800">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">
                        {[address.city, address.street].filter(Boolean).join(", ")}
                    </span>
                </div>
            )}

            {/* Footer Actions */}
            {actions && (
                <CardFooter className="bg-gray-50/50 dark:bg-gray-900/60 p-3 pt-3 flex gap-2 justify-end border-t dark:border-gray-800">
                    {actions}
                </CardFooter>
            )}
        </Card>
    );
}
