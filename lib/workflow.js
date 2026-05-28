/**
 * Order Workflow Management
 * Defines valid state transitions per role
 */

// Order status flow:
// OrderCreated -> PaymentPending -> PaymentConfirmed -> TailoringPending -> TailoringInProgress 
// -> TailoringCompleted -> DeliveryPending -> OutForPickup -> PickedUp -> OutForDelivery -> Delivered -> Completed

const transitions = {
  USER: {
    OrderCreated: ["PaymentPending", "Canceled"],
    PaymentPending: ["Canceled"],           // User can cancel before payment
    PaymentConfirmed: [],                   // Cannot cancel after payment
    TailoringPending: [],
    TailoringInProgress: [],
    TailoringCompleted: [],
    DeliveryPending: [],
    OutForPickup: [],
    PickedUp: [],
    OutForDelivery: [],
    Delivered: ["Completed"],               // User confirms completion
    Completed: [],
    Canceled: [],
  },
  SHOPKEEPER: {
    OrderCreated: ["PaymentPending", "Canceled"],
    PaymentPending: ["PaymentConfirmed", "Canceled"],
    PaymentConfirmed: ["TailoringPending", "Canceled"],
    TailoringPending: ["TailoringInProgress"],  // Shopkeeper can also start tailoring if they're the tailor
    TailoringInProgress: ["TailoringCompleted"],
    TailoringCompleted: ["DeliveryPending"],
  },
  TAILOR: {
    TailoringPending: ["TailoringInProgress"],
    TailoringInProgress: ["TailoringCompleted"],
  },
  DELIVERY: {
    DeliveryPending: ["OutForPickup"],
    OutForPickup: ["PickedUp"],
    PickedUp: ["OutForDelivery"],
    OutForDelivery: ["Delivered"],
  },
  ADMIN: {
    // Admin can manage all critical transitions
    OrderCreated: ["PaymentPending", "PaymentConfirmed", "Canceled"],
    PaymentPending: ["PaymentConfirmed", "Canceled"],
    PaymentConfirmed: ["TailoringPending", "Canceled"],
    TailoringPending: ["TailoringInProgress", "TailoringCompleted"],
    TailoringInProgress: ["TailoringCompleted"],
    TailoringCompleted: ["DeliveryPending"],
    DeliveryPending: ["OutForPickup", "OutForDelivery"],
    OutForPickup: ["PickedUp"],
    PickedUp: ["OutForDelivery"],
    OutForDelivery: ["Delivered"],
    Delivered: ["Completed"],
    Completed: [],
    Canceled: [],
  },
};

/**
 * Check if a role can transition an order from current to target status
 * @param {string} role - User role (USER, TAILOR, SHOPKEEPER, DELIVERY, ADMIN)
 * @param {string} current - Current order status
 * @param {string} target - Target order status
 * @returns {boolean} - Whether the transition is allowed
 */
export function canTransition(role, current, target) {
  const allowed = transitions[role] || {};
  const list = allowed[current] || [];
  return list.includes(target);
}

/**
 * Get all possible next statuses for a given role and current status
 * @param {string} role - User role
 * @param {string} current - Current order status
 * @returns {string[]} - Array of possible next statuses
 */
export function getNextStatuses(role, current) {
  const allowed = transitions[role] || {};
  return allowed[current] || [];
}

/**
 * Get human-readable status label
 * @param {string} status - Order status
 * @returns {string} - Human-readable label
 */
export function getStatusLabel(status) {
  const labels = {
    OrderCreated: "Order Created",
    PaymentPending: "Payment Pending",
    PaymentConfirmed: "Payment Confirmed",
    TailoringPending: "Awaiting Tailor",
    TailoringInProgress: "Tailoring In Progress",
    TailoringCompleted: "Tailoring Completed",
    DeliveryPending: "Ready for Pickup",
    OutForPickup: "Courier En Route to Pickup",
    PickedUp: "Picked Up from Shop",
    OutForDelivery: "Out for Delivery",
    Delivered: "Delivered",
    Completed: "Completed",
    Canceled: "Canceled",
  };
  return labels[status] || status;
}

/**
 * Get status color for UI display
 * @param {string} status - Order status
 * @returns {object} - Color classes { bg, text, border }
 */
export function getStatusColor(status) {
  const colors = {
    OrderCreated: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" },
    PaymentPending: { bg: "bg-yellow-50 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-700" },
    PaymentConfirmed: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-700" },
    TailoringPending: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-700" },
    TailoringInProgress: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-200", border: "border-purple-300 dark:border-purple-700" },
    TailoringCompleted: { bg: "bg-indigo-50 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-700" },
    DeliveryPending: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-700" },
    OutForPickup: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-700" },
    PickedUp: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-200", border: "border-orange-300 dark:border-orange-700" },
    OutForDelivery: { bg: "bg-cyan-50 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-700" },
    Delivered: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-700" },
    Completed: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-200", border: "border-green-300 dark:border-green-700" },
    Canceled: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-700" },
  };
  return colors[status] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" };
}

/**
 * Check if order requires tailor assignment at current status
 * @param {string} status - Current order status
 * @returns {boolean}
 */
export function requiresTailorAssignment(status) {
  return status === "TailoringPending" || status === "PaymentConfirmed";
}

/**
 * Check if order requires delivery assignment at current status
 * @param {string} status - Current order status
 * @returns {boolean}
 */
export function requiresDeliveryAssignment(status) {
  return status === "DeliveryPending";
}

/**
 * Get the progress percentage based on status
 * @param {string} status - Order status
 * @returns {number} - Progress percentage (0-100)
 */
export function getOrderProgress(status) {
  const progress = {
    OrderCreated: 5,
    PaymentPending: 10,
    PaymentConfirmed: 20,
    TailoringPending: 30,
    TailoringInProgress: 50,
    TailoringCompleted: 70,
    DeliveryPending: 75,
    OutForPickup: 80,
    PickedUp: 85,
    OutForDelivery: 90,
    Delivered: 95,
    Completed: 100,
    Canceled: 0,
  };
  return progress[status] || 0;
}
