"use client";
import { getStatusLabel, getStatusColor, getOrderProgress } from "@/lib/workflow";
import {
    Clock,
    CreditCard,
    CheckCircle,
    Scissors,
    Package,
    Truck,
    XCircle,
    MapPin,
    Home
} from "lucide-react";

/**
 * Get the appropriate icon for an order status
 */
function getStatusIcon(status) {
    const icons = {
        OrderCreated: Clock,
        PaymentPending: CreditCard,
        PaymentConfirmed: CheckCircle,
        TailoringPending: Scissors,
        TailoringInProgress: Scissors,
        TailoringCompleted: CheckCircle,
        DeliveryPending: Package,
        OutForPickup: Truck,
        PickedUp: Truck,
        OutForDelivery: Truck,
        Delivered: Home,
        Completed: CheckCircle,
        Canceled: XCircle,
    };
    return icons[status] || Clock;
}

/**
 * OrderStatusBadge - Displays order status with consistent styling
 */
export function OrderStatusBadge({ status, size = "md", showIcon = true }) {
    const colors = getStatusColor(status);
    const label = getStatusLabel(status);
    const Icon = getStatusIcon(status);

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 rounded-full font-medium border
                ${colors.bg} ${colors.text} ${colors.border}
                ${sizeClasses[size]}
            `}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {label}
        </span>
    );
}

/**
 * OrderProgressBar - Visual progress indicator for order status
 */
export function OrderProgressBar({ status, showLabel = true }) {
    const progress = getOrderProgress(status);
    const colors = getStatusColor(status);

    return (
        <div className="space-y-1">
            {showLabel && (
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Progress</span>
                    <span className="font-medium">{progress}%</span>
                </div>
            )}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${status === "Canceled" ? "bg-red-500" :
                            status === "Completed" ? "bg-green-500" :
                                "bg-blue-500"
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

/**
 * OrderTimeline - Displays order status timeline
 */
export function OrderTimeline({ timeline, currentStatus }) {
    const statuses = [
        "OrderCreated",
        "PaymentPending",
        "PaymentConfirmed",
        "TailoringPending",
        "TailoringInProgress",
        "TailoringCompleted",
        "DeliveryPending",
        "OutForDelivery",
        "Delivered",
        "Completed"
    ];

    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="space-y-4">
            {timeline && timeline.length > 0 ? (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                    {/* Timeline items */}
                    <div className="space-y-4">
                        {timeline.map((item, index) => {
                            const Icon = getStatusIcon(item.event);
                            const colors = getStatusColor(item.event);
                            const isLatest = index === timeline.length - 1;

                            return (
                                <div key={index} className="relative flex items-start gap-4">
                                    <div className={`
                                        relative z-10 flex items-center justify-center w-8 h-8 rounded-full
                                        ${isLatest ? colors.bg : "bg-gray-100"}
                                        ${isLatest ? colors.border : "border-gray-200"} 
                                        border-2
                                    `}>
                                        <Icon className={`h-4 w-4 ${isLatest ? colors.text : "text-gray-400"}`} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className={`font-medium ${isLatest ? "text-gray-900" : "text-gray-600"}`}>
                                            {getStatusLabel(item.event)}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{item.byRole}</span>
                                            {item.at && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(item.at).toLocaleString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // Default timeline based on current status
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {statuses.slice(0, 6).map((status, index) => {
                        const isActive = index <= currentIndex;
                        const isCurrent = status === currentStatus;
                        const Icon = getStatusIcon(status);

                        return (
                            <div key={status} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-full border-2
                                        ${isCurrent ? "border-blue-500 bg-blue-50" :
                                            isActive ? "border-green-500 bg-green-50" :
                                                "border-gray-200 bg-gray-50"}
                                    `}>
                                        <Icon className={`h-4 w-4 ${isCurrent ? "text-blue-600" :
                                                isActive ? "text-green-600" :
                                                    "text-gray-400"
                                            }`} />
                                    </div>
                                    <span className={`text-xs mt-1 text-center max-w-16 ${isCurrent ? "text-blue-600 font-medium" :
                                            isActive ? "text-green-600" :
                                                "text-gray-400"
                                        }`}>
                                        {getStatusLabel(status).split(" ")[0]}
                                    </span>
                                </div>
                                {index < 5 && (
                                    <div className={`w-8 h-0.5 ${index < currentIndex ? "bg-green-500" : "bg-gray-200"
                                        }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default OrderStatusBadge;
