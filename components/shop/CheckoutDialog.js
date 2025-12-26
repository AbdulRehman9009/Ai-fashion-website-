"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Need to create Switch or use checkbox
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";

export default function CheckoutDialog({ open, onOpenChange, product, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [address, setAddress] = useState("");

  if (!product) return null;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ 
            productId: product._id, 
            quantity: 1
          }],
          tailoringRequests: tailoring ? [{ name: "Standard Alteration", price: 25 }] : [],
          urgent,
          shopId: product.shop,
          shippingAddress: { street: address } 
        }),
      });

      if (!res.ok) throw new Error("Failed to place order");

      toast.success("Order placed successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  const tailoringFee = 25;
  const deliveryFee = 15;
  const urgentFee = 20;
  
  const total = product.basePrice + (tailoring ? tailoringFee : 0) + deliveryFee + (urgent ? urgentFee : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Order</DialogTitle>
          <DialogDescription>
            You are ordering <strong>{product.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Base Price</Label>
            <span>${product.basePrice}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Switch id="tailoring" checked={tailoring} onCheckedChange={setTailoring} />
                <Label htmlFor="tailoring">Add Tailoring (+${tailoringFee})</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
                <Label htmlFor="urgent">Urgent Delivery (+${urgentFee})</Label>
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-500 text-sm">
            <Label>Delivery Fee</Label>
            <span>${deliveryFee}</span>
          </div>
          
           <div className="grid gap-2">
            <Label htmlFor="address">Shipping Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City" />
          </div>

          <div className="flex items-center justify-between font-bold text-lg border-t pt-4">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePlaceOrder} disabled={loading || !address}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Place Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
