const transitions = {
  USER: {
    OrderCreated: ["PaymentPending"],
    PaymentPending: [],
    PaymentConfirmed: [],
    TailoringPending: [],
    TailoringInProgress: [],
    TailoringCompleted: [],
    DeliveryPending: [],
    OutForPickup: [],
    PickedUp: [],
    OutForDelivery: [],
    Delivered: ["Completed"],
    Completed: [],
    Canceled: [],
  },
  SHOPKEEPER: {
    OrderCreated: ["PaymentConfirmed", "Canceled"],
    PaymentPending: ["PaymentConfirmed", "Canceled"],
    PaymentConfirmed: ["TailoringPending", "Canceled"],
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
    OrderCreated: ["Canceled"],
    PaymentPending: ["Canceled"],
  },
};

export function canTransition(role, current, target) {
  const allowed = transitions[role] || {};
  const list = allowed[current] || [];
  return list.includes(target);
}

