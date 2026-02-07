"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);
    const [orderId, setOrderId] = useState(null);

    // Paddle adds _ptxn query param for transaction ID on return
    const transactionId = searchParams.get("_ptxn") || searchParams.get("transaction_id");

    useEffect(() => {
        if (transactionId) {
            verifyPayment();
        } else {
            // If no transaction ID, just show success (maybe COD or direct navigation)
            setVerifying(false);

            // Try to find recent order from local storage or context if possible
            // For now, just show generic success
        }
    }, [transactionId]);

    const verifyPayment = async () => {
        try {
            // Call our backend to verify transaction and update order
            const res = await axios.post("/api/payments/verify", {
                transactionId
            });

            if (res.data.success) {
                setOrderId(res.data.orderId);
                // Clear cart
                try {
                    await axios.delete("/api/cart");
                    // Trigger cart update event usually
                    window.dispatchEvent(new Event("cart-updated"));
                } catch (e) {
                    console.error("Failed to clear cart", e);
                }
            }
        } catch (error) {
            console.error("Payment verification failed", error);
            toast.error("Could not verify payment instantly. Don't worry, we'll check via webhook.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Thank you for your purchase. Your order has been placed and is being processed.
                </p>

                {verifying ? (
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying transaction details...
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Link href={orderId ? `/dashboard/user/orders/${orderId}` : "/dashboard/user/orders"}>
                            <Button className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                View Order Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>

                        <Link href="/shop">
                            <Button variant="outline" className="w-full">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
