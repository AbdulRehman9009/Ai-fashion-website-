"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard, Banknote, Truck, Scissors, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export default function CheckoutDialog({ open, onOpenChange, product, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderCreated, setOrderCreated] = useState(null);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "Pakistan"
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setOrderCreated(null);
      setPaymentMethod("card");
      setTailoring(false);
      setUrgent(false);
    }
  }, [open]);

  // Auto-fill shipping info from profile
  useEffect(() => {
    if (open) {
      fetchShippingData();
    }
  }, [open]);

  const fetchShippingData = async () => {
    setAddressLoading(true);
    try {
      const res = await axios.get("/api/profile/shipping");
      if (res.data.hasShippingData && res.data.shippingAddress) {
        const addr = res.data.shippingAddress;
        setShippingAddress({
          name: addr.name || "",
          phone: addr.phone || "",
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          zip: addr.zip || "",
          country: addr.country || "Pakistan"
        });
      }
    } catch (error) {
      console.error("Error fetching shipping data:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  if (!product) return null;

  const tailoringFee = 25;
  const deliveryFee = 15;
  const urgentFee = 20;
  const price = product.price || product.basePrice || 0;
  const total = price + (tailoring ? tailoringFee : 0) + deliveryFee + (urgent ? urgentFee : 0);

  const validateAddress = () => {
    const required = ["name", "phone", "street", "city"];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/orders", {
        items: [{
          productId: product._id,
          quantity: 1
        }],
        tailoringRequests: tailoring ? [{ name: "Custom Tailoring", price: tailoringFee }] : [],
        urgent,
        shopId: product.shop?._id || product.shop || product.shopId,
        shippingAddress,
        paymentMethod,
        totalAmount: total
      });

      const data = res.data;

      if (data.id) {
        setOrderCreated({
          id: data.id,
          checkoutUrl: data.checkoutUrl || null,
          paymentMethod: data.paymentMethod || "COD"
        });

        // For card payments with Paddle checkout URL
        if (paymentMethod === "card" && data.checkoutUrl) {
          toast.success("Order created! Redirecting to secure payment...");
          // Small delay to show toast before redirect
          setTimeout(() => {
            window.location.href = data.checkoutUrl;
          }, 1000);
          return;
        }

        // For COD or when card checkout URL not available
        toast.success("Order placed successfully! Pay on delivery.");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Order error:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to place order";
      toast.error(errorMsg);

      // Handle profile incomplete error
      if (error.response?.data?.redirect) {
        setTimeout(() => {
          window.location.href = error.response.data.redirect;
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase for <strong className="text-gray-900 dark:text-white">{product.name || product.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Product Info */}
          <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.title || product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {product.title || product.name}
              </h3>
              <p className="text-sm text-gray-500">{product.category}</p>
              <p className="font-bold text-indigo-600">${price.toFixed(2)}</p>
            </div>
          </div>

          {/* Order Options */}
          <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-purple-600" />
                <Label htmlFor="tailoring" className="text-sm cursor-pointer">Custom Tailoring</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{tailoring ? `+$${tailoringFee}` : "Standard"}</span>
                <Switch id="tailoring" checked={tailoring} onCheckedChange={setTailoring} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <Label htmlFor="urgent" className="text-sm cursor-pointer">Express Delivery</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{urgent ? `+$${urgentFee}` : "Standard"}</span>
                <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-green-600" /> Shipping Address
            </Label>
            {addressLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Full Name *"
                  value={shippingAddress.name}
                  onChange={(e) => handleAddressChange("name", e.target.value)}
                  className="col-span-2 sm:col-span-1"
                />
                <Input
                  placeholder="Phone Number *"
                  value={shippingAddress.phone}
                  onChange={(e) => handleAddressChange("phone", e.target.value)}
                  className="col-span-2 sm:col-span-1"
                />
                <Input
                  placeholder="Street Address *"
                  value={shippingAddress.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  className="col-span-2"
                />
                <Input
                  placeholder="City *"
                  value={shippingAddress.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
                <Input
                  placeholder="State/Province"
                  value={shippingAddress.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="font-semibold">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${paymentMethod === "card"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
              >
                <CreditCard className={`h-6 w-6 mb-2 ${paymentMethod === "card" ? "text-indigo-600" : "text-gray-500"}`} />
                <span className={`text-sm font-medium ${paymentMethod === "card" ? "text-indigo-600" : "text-gray-700 dark:text-gray-300"}`}>
                  Card Payment
                </span>
                <span className="text-xs text-gray-500 mt-1">Secure via Paddle</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${paymentMethod === "cod"
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
              >
                <Banknote className={`h-6 w-6 mb-2 ${paymentMethod === "cod" ? "text-amber-600" : "text-gray-500"}`} />
                <span className={`text-sm font-medium ${paymentMethod === "cod" ? "text-amber-600" : "text-gray-700 dark:text-gray-300"}`}>
                  Cash on Delivery
                </span>
                <span className="text-xs text-gray-500 mt-1">Pay when received</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span>${(deliveryFee + (urgent ? urgentFee : 0)).toFixed(2)}</span>
            </div>
            {tailoring && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Custom Tailoring</span>
                <span>${tailoringFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className={`w-full sm:w-auto min-w-[160px] ${paymentMethod === "card"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                : "bg-amber-600 hover:bg-amber-700"
              } text-white`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {paymentMethod === "card" ? <CreditCard className="mr-2 h-4 w-4" /> : <Banknote className="mr-2 h-4 w-4" />}
                {paymentMethod === "card" ? `Pay $${total.toFixed(2)}` : `Order - $${total.toFixed(2)}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
