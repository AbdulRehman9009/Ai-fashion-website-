"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard, Banknote, Truck, Scissors, MapPin, Check } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CheckoutDialog({ open, onOpenChange, product, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment
  const [tailoring, setTailoring] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  if (!product) return null;

  const tailoringFee = 25;
  const deliveryFee = 15;
  const urgentFee = 20;
  const price = product.price || product.basePrice || 0; // handle different naming if any
  const total = price + (tailoring ? tailoringFee : 0) + deliveryFee + (urgent ? urgentFee : 0);

  const handlePlaceOrder = async () => {
    // Basic validation
    if (!address) {
      toast.error("Please provide a shipping address.");
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      // Simulate Payment Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            productId: product._id,
            quantity: 1
          }],
          tailoringRequests: tailoring ? [{ name: "Custom Tailoring", price: tailoringFee }] : [],
          urgent,
          shopId: product.shop || product.shopId, // Handle both
          shippingAddress: { street: address },
          paymentMethod,
          totalAmount: total
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to place order");

      if (data.checkoutUrl) {
        toast.success("Order created! Redirecting to payment...");
        window.location.href = data.checkoutUrl;
        return;
      }

      toast.success("Order placed successfully!");
      onSuccess();
      onOpenChange(false);

      // Reset state
      setStep(1);
      setAddress("");
      setTailoring(false);
      setUrgent(false);

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase for <strong>{product.name || product.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Steps Indicator could go here, but let's keep it simple with dynamic content */}

          {/* Order Configuration */}
          <div className="space-y-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-purple-600" />
                <Label htmlFor="tailoring" className="text-base cursor-pointer">Custom Tailoring</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 text-right">{tailoring ? `+$${tailoringFee}` : "Standard Size"}</span>
                <Switch id="tailoring" checked={tailoring} onCheckedChange={setTailoring} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <Label htmlFor="urgent" className="text-base cursor-pointer">Urgent Delivery</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{urgent ? `+$${urgentFee}` : "Standard"}</span>
                <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Shipping Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Fashion Ave, Design City"
              className="bg-white dark:bg-gray-800"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup defaultValue="card" onValueChange={setPaymentMethod}>
              <div className="grid grid-cols-2 gap-4">
                <Label htmlFor="payment-card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [:has([data-state=checked])_&]:border-primary cursor-pointer transition-all">
                  <RadioGroupItem value="card" id="payment-card" className="sr-only" />
                  <CreditCard className="mb-3 h-6 w-6" />
                  Card
                </Label>
                <Label htmlFor="payment-cod" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [:has([data-state=checked])_&]:border-primary cursor-pointer transition-all">
                  <RadioGroupItem value="cod" id="payment-cod" className="sr-only" />
                  <Banknote className="mb-3 h-6 w-6" />
                  COD
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>${price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span>${deliveryFee + (urgent ? urgentFee : 0)}</span>
            </div>
            {tailoring && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tailoring</span>
                <span>${tailoringFee}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span className="text-green-600">${total}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-900 min-w-[120px]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay $${total}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
