import { cn } from "@/lib/utils";

const statusConfig = {
    // Order statuses
    OrderCreated: { label: "Created", color: "bg-gray-100 text-gray-700 border-gray-300" },
    PaymentPending: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    PaymentConfirmed: { label: "Paid", color: "bg-green-100 text-green-700 border-green-300" },
    TailoringPending: { label: "Tailoring Pending", color: "bg-blue-100 text-blue-700 border-blue-300" },
    TailoringInProgress: { label: "In Progress", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
    TailoringCompleted: { label: "Tailoring Done", color: "bg-purple-100 text-purple-700 border-purple-300" },
    DeliveryPending: { label: "Delivery Pending", color: "bg-orange-100 text-orange-700 border-orange-300" },
    OutForPickup: { label: "Out for Pickup", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
    PickedUp: { label: "Picked Up", color: "bg-teal-100 text-teal-700 border-teal-300" },
    OutForDelivery: { label: "Out for Delivery", color: "bg-blue-100 text-blue-700 border-blue-300" },
    Delivered: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-300" },
    Completed: { label: "Completed", color: "bg-green-100 text-green-800 border-green-400" },
    Canceled: { label: "Canceled", color: "bg-red-100 text-red-700 border-red-300" },

    // Payment statuses
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    AUTHORIZED: { label: "Authorized", color: "bg-blue-100 text-blue-700 border-blue-300" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-700 border-green-300" },
    REFUNDED: { label: "Refunded", color: "bg-red-100 text-red-700 border-red-300" },

    // Tailor acceptance
    Pending: { label: "Pending", color: "bg-gray-100 text-gray-700 border-gray-300" },
    Accepted: { label: "Accepted", color: "bg-green-100 text-green-700 border-green-300" },
    Rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300" },

    // Transfer statuses
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    transferred: { label: "Transferred", color: "bg-green-100 text-green-700 border-green-300" },
    failed: { label: "Failed", color: "bg-red-100 text-red-700 border-red-300" },
    paid: { label: "Paid", color: "bg-green-100 text-green-700 border-green-300" },

    // Stripe account statuses
    not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700 border-gray-300" },
    active: { label: "Active", color: "bg-green-100 text-green-700 border-green-300" },
    restricted: { label: "Restricted", color: "bg-red-100 text-red-700 border-red-300" },

    // Generic
    urgent: { label: "Urgent", color: "bg-red-100 text-red-700 border-red-300" },

    // Additional Fulfillment Statuses
    placed: { label: "Placed", color: "bg-blue-100 text-blue-700 border-blue-300" },
    ready_for_delivery: { label: "Ready for Delivery", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
    out_for_delivery: { label: "Out for Delivery", color: "bg-blue-100 text-blue-700 border-blue-300" },
    stitched: { label: "Stitched", color: "bg-green-100 text-green-700 border-green-300" },
};

export default function StatusBadge({ status, size = "md", className }) {
    const config = statusConfig[status] || {
        label: status,
        color: "bg-gray-100 text-gray-700 border-gray-300",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border font-medium transition-all duration-200",
                config.color,
                sizes[size],
                className
            )}
        >
            {config.label}
        </span>
    );
}
