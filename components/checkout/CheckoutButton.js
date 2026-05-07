"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function CheckoutButton({
    orderId,
    amount,
    currency = "USD",
    disabled = false,
    className = ""
}) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!orderId) {
            toast.error("Order ID is required");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/checkout", { orderId });

            if (res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            } else if (res.data.transactionId) {
                if (window.Paddle) {
                    window.Paddle.Checkout.open({
                        transactionId: res.data.transactionId,
                        settings: {
                            displayMode: "overlay",
                            theme: "light",
                            successUrl: `${window.location.origin}/checkout/success?orderId=${orderId}`,
                        }
                    });
                } else {
                    toast.info("Processing checkout...");
                }
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.error || "Failed to start checkout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={handleCheckout}
                disabled={loading || disabled}
                className={`w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg ${className}`}
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                )}
                {loading ? "Processing..." : `Pay ${currency} ${amount?.toFixed(2) || ""}`}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span>Secure payment powered by Paddle</span>
            </div>
        </div>
    );
}
