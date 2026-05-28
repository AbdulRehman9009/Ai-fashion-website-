import { cn } from "@/lib/utils";

const statusConfig = {
    // Order statuses
    OrderCreated: { label: "Created", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    PaymentPending: { label: "Payment Pending", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700" },
    PaymentConfirmed: { label: "Paid", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
    TailoringPending: { label: "Tailoring Pending", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
    TailoringInProgress: { label: "In Progress", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700" },
    TailoringCompleted: { label: "Tailoring Done", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700" },
    DeliveryPending: { label: "Delivery Pending", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700" },
    OutForPickup: { label: "Out for Pickup", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700" },
    PickedUp: { label: "Picked Up", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700" },
    OutForDelivery: { label: "Out for Delivery", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
    Delivered: { label: "Delivered", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
    Completed: { label: "Completed", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-400 dark:border-green-700" },
    Canceled: { label: "Canceled", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },

    // Payment statuses
    PENDING: { label: "Pending", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700" },
    AUTHORIZED: { label: "Authorized", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
    PAID: { label: "Paid", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
    REFUNDED: { label: "Refunded", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },

    // Tailor acceptance
    Pending: { label: "Pending", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    Accepted: { label: "Accepted", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
    Rejected: { label: "Rejected", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },

    // Transfer statuses
    pending: { label: "Pending", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700" },
    transferred: { label: "Transferred", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
    failed: { label: "Failed", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
    paid: { label: "Paid", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },

    // Delivery document statuses
    Assigned: { label: "Assigned", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },

    // Stripe account statuses
    not_started: { label: "Not Started", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" },
    active: { label: "Active", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
    restricted: { label: "Restricted", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },

    // Generic
    urgent: { label: "Urgent", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },

    // Additional Fulfillment Statuses
    placed: { label: "Placed", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
    ready_for_delivery: { label: "Ready for Delivery", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700" },
    out_for_delivery: { label: "Out for Delivery", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
    stitched: { label: "Stitched", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
};

export default function StatusBadge({ status, size = "md", className }) {
    const config = statusConfig[status] || {
        label: status,
        color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
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
