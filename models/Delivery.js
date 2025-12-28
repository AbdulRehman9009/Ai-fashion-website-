import mongoose from "mongoose";

const DeliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    pickupAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    dropoffAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    status: {
      type: String,
      enum: ["Assigned", "OutForPickup", "PickedUp", "OutForDelivery", "Delivered"],
      default: "Assigned",
      index: true,
    },
    deliveryNotes: { type: String },
    confirmedAt: { type: Date },
    fee: { type: Number, default: 10 },
    urgentBonus: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
      index: true,
    },
    events: [
      {
        at: { type: Date, default: Date.now },
        status: String,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Delivery || mongoose.model("Delivery", DeliverySchema);

