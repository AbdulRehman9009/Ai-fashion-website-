"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { getProductImage } from "@/lib/productImages";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import axios from "axios";
import { validateCart, getCartShopId } from "@/lib/utils/cartValidation";
import {
    ShoppingCart, ArrowLeft, Trash2, Plus, Minus, MapPin,
    CreditCard, Truck, Package, ShieldCheck, Loader2,
    CheckCircle, AlertCircle, ChevronRight
} from "lucide-react";

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, cartCount, removeFromCart, updateQuantity, loading: cartLoading, clearCart, refreshCart } = useCart();

    const [step, setStep] = useState(1); // 1: Review, 2: Shipping, 3: Payment
    const [loading, setLoading] = useState(false);
    const [orderCreated, setOrderCreated] = useState(null);

    // Shipping form state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Pakistan",
        notes: ""
    });
    const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'cod'
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/user/login?redirect=/checkout");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            setShippingInfo(prev => ({
                ...prev,
                fullName: session.user.name || "",
            }));
        }
    }, [session]);

    // Auto-fill shipping info from profile when entering shipping step
    const fetchAndFillShippingData = async () => {
        try {
            const res = await axios.get("/api/profile/shipping");
            if (res.data.hasShippingData && res.data.shippingAddress) {
                const addr = res.data.shippingAddress;
                setShippingInfo(prev => ({
                    ...prev,
                    fullName: addr.name || prev.fullName,
                    phone: addr.phone || prev.phone,
                    address: addr.street || prev.address,
                    city: addr.city || prev.city,
                    state: addr.state || prev.state,
                    zipCode: addr.zip || prev.zipCode,
                    country: addr.country || prev.country,
                }));
            }
        } catch (error) {
            console.error("Error fetching shipping data:", error);
        }
    };

    // Calculate totals (USD pricing)
    const calculations = useMemo(() => {
        const subtotal = cart.reduce((total, item) => {
            const price = item.product?.basePrice || item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);

        const shippingFee = subtotal > 50 ? 0 : 8; // Free shipping over $50
        const taxRate = 0.05; // 5% tax
        const tax = subtotal * taxRate;
        const total = subtotal + shippingFee + tax;

        return { subtotal, shippingFee, tax, total };
    }, [cart]);

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    // Handle payment success (for manual/COD payments when Paddle is not configured)
    const handlePaymentSuccess = async () => {
        if (!orderCreated?._id) {
            toast.error("No order found. Please try creating your order again.");
            return;
        }

        setLoading(true);
        try {
            // Show confirmation for Pay Later / COD option
            toast.info("Order placed! Payment will be collected on delivery (COD).");
            clearCart();
            // Redirect to orders page to see the pending order
            router.push(`/dashboard/user?tab=orders`);
        } catch (error) {
            console.error("Error processing order:", error);
            toast.error("Something went wrong. Please check your orders.");
        } finally {
            setLoading(false);
        }
    };

    const validateShipping = () => {
        const required = ['fullName', 'phone', 'address', 'city', 'state', 'zipCode'];
        for (const field of required) {
            if (!shippingInfo[field]?.trim()) {
                toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
        return true;
    };

    const handleCreateOrder = async () => {
        // Validate shipping info
        if (!validateShipping()) return;

        // Validate cart is not empty
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // Validate multi-shop constraint
        const cartValidation = validateCart(cart);
        if (!cartValidation.valid) {
            toast.error(cartValidation.error);
            return;
        }

        setLoading(true);
        try {
            // Get shopId from cart
            const shopId = getCartShopId(cart);
            if (!shopId) {
                toast.error("Unable to determine shop. Please try again.");
                setLoading(false);
                return;
            }

            const orderItems = cart.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
            }));

            const response = await axios.post("/api/orders", {
                items: orderItems,
                shopId: shopId.toString(),
                shippingAddress: {
                    street: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    zip: shippingInfo.zipCode,
                    country: shippingInfo.country,
                    phone: shippingInfo.phone,
                    fullName: shippingInfo.fullName,
                    notes: shippingInfo.notes,
                },
                paymentMethod: paymentMethod,
            });

            if (response.data.id) {
                const orderId = response.data.id;
                const checkoutUrl = response.data.checkoutUrl;

                if (paymentMethod === "card" && checkoutUrl) {
                    toast.success("Order placed! Redirecting to payment...");
                    window.location.href = checkoutUrl;
                    return;
                }

                setOrderCreated({
                    _id: orderId,
                    paddleCheckoutUrl: checkoutUrl || null
                });
                setStep(3);

                if (paymentMethod === "cod") {
                    toast.success("Order placed successfully! Pay on delivery.");
                    clearCart();
                }
            }
        } catch (error) {
            console.error("Order creation error:", error);
            toast.error(error.response?.data?.error || "Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    // Poll order status to verify payment completion via webhook
    useEffect(() => {
        if (!orderCreated?._id) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/orders/${orderCreated._id}`);
                if (res.data.paymentStatus === "PAID") {
                    clearInterval(pollInterval);
                    clearCart();
                    toast.success("Payment verified! Your order is confirmed.");
                    router.push(`/dashboard/user?tab=orders`);
                }
            } catch (err) {
                console.error("Order status poll error:", err);
            }
        }, 3000); // Poll every 3 seconds

        // Cleanup after 5 minutes
        const timeout = setTimeout(() => clearInterval(pollInterval), 300000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [orderCreated, clearCart, router]);

    // Loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // Empty cart
    if (cartCount === 0 && !orderCreated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 sm:p-12 border border-slate-200 dark:border-slate-800">
                        <ShoppingCart className="h-20 w-20 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h1>
                        <p className="text-slate-500 mb-6">Add some products to your cart to proceed with checkout.</p>
                        <Link href="/shops">
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                Browse Shops
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-6 px-4 sm:py-10 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <Link href="/dashboard/user" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Checkout</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cartCount} items in your cart</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
                    {[
                        { num: 1, label: "Review" },
                        { num: 2, label: "Shipping" },
                        { num: 3, label: "Payment" }
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${step >= s.num
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                }`}>
                                {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={`ml-2 text-sm font-medium hidden sm:inline ${step >= s.num ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                                }`}>
                                {s.label}
                            </span>
                            {idx < 2 && (
                                <ChevronRight className={`mx-2 sm:mx-4 h-4 w-4 ${step > s.num ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-700"
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Review Cart */}
                            {step === 1 && (
                                <motion.div
                                    key="review"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                                                Review Your Items
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {cart.map((item, index) => (
                                                <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                    {/* Product Image */}
                                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                        <Image
                                                            src={getProductImage(item.product)}
                                                            alt={item.product?.title || "Product image"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                            {item.product?.name || "Product"}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                            {item.product?.shop?.name || "Shop"}
                                                        </p>
                                                        <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                                                            ${(item.product?.basePrice || 0).toFixed(2)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button
                                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                                disabled={cartLoading || item.quantity <= 1}
                                                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 text-slate-700 dark:text-slate-300"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="w-6 text-center font-medium text-sm text-slate-900 dark:text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                                                disabled={cartLoading}
                                                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-700 dark:text-slate-300"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Item Total & Remove */}
                                                    <div className="flex flex-col items-end justify-between">
                                                        <button
                                                            onClick={() => removeFromCart(index)}
                                                            disabled={cartLoading}
                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <p className="font-bold text-slate-900 dark:text-white">
                                                            ${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                onClick={() => {
                                                    fetchAndFillShippingData();
                                                    setStep(2);
                                                }}
                                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base"
                                            >
                                                Continue to Shipping
                                                <ChevronRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Step 2: Shipping Info */}
                            {step === 2 && (
                                <motion.div
                                    key="shipping"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-indigo-600" />
                                                Shipping Information
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 dark:text-slate-400">Enter your delivery address</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="fullName">Full Name *</Label>
                                                    <Input
                                                        id="fullName"
                                                        name="fullName"
                                                        value={shippingInfo.fullName}
                                                        onChange={handleShippingChange}
                                                        placeholder="John Doe"
                                                        className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone">Phone Number *</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={shippingInfo.phone}
                                                        onChange={handleShippingChange}
                                                        placeholder="03XX-XXXXXXX"
                                                        className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="address">Street Address *</Label>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    value={shippingInfo.address}
                                                    onChange={handleShippingChange}
                                                    placeholder="House #, Street, Area"
                                                    className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="city">City *</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={shippingInfo.city}
                                                        onChange={handleShippingChange}
                                                        placeholder="Lahore"
                                                        className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="state">State/Province *</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        value={shippingInfo.state}
                                                        onChange={handleShippingChange}
                                                        placeholder="Punjab"
                                                        className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <Label htmlFor="zipCode">ZIP Code *</Label>
                                                    <Input
                                                        id="zipCode"
                                                        name="zipCode"
                                                        value={shippingInfo.zipCode}
                                                        onChange={handleShippingChange}
                                                        placeholder="54000"
                                                        className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                                                <Input
                                                    id="notes"
                                                    name="notes"
                                                    value={shippingInfo.notes}
                                                    onChange={handleShippingChange}
                                                    placeholder="Any special delivery instructions"
                                                    className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                                />
                                            </div>

                                            {/* Payment Method Selection */}
                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                                                <Label className="text-base font-semibold">Payment Method</Label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div
                                                        onClick={() => setPaymentMethod("card")}
                                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${paymentMethod === "card"
                                                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600"
                                                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/50"
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${paymentMethod === "card" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                                                            <CreditCard className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">Credit / Debit Card</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faster, secure checkout with Card</p>
                                                        </div>
                                                        {paymentMethod === "card" && <CheckCircle className="h-5 w-5 text-indigo-600 ml-auto" />}
                                                    </div>

                                                    <div
                                                        onClick={() => setPaymentMethod("cod")}
                                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${paymentMethod === "cod"
                                                            ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-600"
                                                            : "border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 bg-slate-50 dark:bg-slate-800/50"
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${paymentMethod === "cod" ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                                                            <Truck className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">Cash on Delivery</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pay when your package arrives</p>
                                                        </div>
                                                        {paymentMethod === "cod" && <CheckCircle className="h-5 w-5 text-amber-600 ml-auto" />}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-6">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setStep(1)}
                                                    className="flex-1 h-12"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Back
                                                </Button>
                                                <Button
                                                    onClick={handleCreateOrder}
                                                    disabled={loading}
                                                    className={`flex-[2] h-12 text-lg shadow-lg transition-all ${paymentMethod === "card"
                                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                                        : "bg-amber-600 hover:bg-amber-700"
                                                        }`}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            {paymentMethod === "card" ? "Processing..." : "Creating Order..."}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {paymentMethod === "card" ? (
                                                                <>
                                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                                    Pay & Place Order
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Package className="mr-2 h-5 w-5" />
                                                                    Confirm Order (COD)
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Step 3: Payment */}
                            {step === 3 && orderCreated && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                                    <CheckCircle className="h-12 w-12 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-2xl sm:text-3xl font-bold">Order Confirmed!</CardTitle>
                                                    <CardDescription className="text-green-50 opacity-90 mt-2">
                                                        Thank you for your purchase. We've received your order.
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                                <div className="text-center sm:text-left mb-4 sm:mb-0">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Order Number</p>
                                                    <p className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                                                        #{orderCreated._id?.slice(-12).toUpperCase()}
                                                    </p>
                                                </div>
                                                <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                                                <div className="text-center sm:text-right">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Payment Status</p>
                                                    <p className={`text-xl font-bold mt-1 ${paymentMethod === 'cod' ? 'text-amber-600' : 'text-green-600'}`}>
                                                        {paymentMethod === 'cod' ? 'Pay on Delivery' : 'Paid (Card)'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">What's Next?</h3>
                                                <div className="grid gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 text-xs font-bold">1</div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">You will receive an order confirmation email shortly.</p>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 text-xs font-bold">2</div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">The shopkeeper will review and accept your order.</p>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 text-xs font-bold">3</div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">You can track your order progress in your dashboard.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 grid sm:grid-cols-2 gap-4">
                                                <Link href="/dashboard/user?tab=orders" className="w-full">
                                                    <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200">
                                                        <Package className="mr-2 h-5 w-5" />
                                                        View Orders
                                                    </Button>
                                                </Link>
                                                <Link href="/shops" className="w-full">
                                                    <Button variant="outline" className="w-full h-12 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                                        Continue Shopping
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-slate-100 dark:border-slate-800">
                                    <CardTitle className="text-lg text-slate-900 dark:text-white">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-4">
                                    {/* Items Summary */}
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                                                    {item.product?.name} × {item.quantity}
                                                </span>
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    ${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                            <span className="font-medium text-slate-900 dark:text-white">${calculations.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                <Truck className="h-3 w-3" /> Shipping
                                            </span>
                                            <span className={calculations.shippingFee === 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-900 dark:text-white"}>
                                                {calculations.shippingFee === 0 ? "FREE" : `$${calculations.shippingFee.toFixed(2)}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Tax (5%)</span>
                                            <span className="font-medium text-slate-900 dark:text-white">${calculations.tax.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                ${calculations.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Free Shipping Notice */}
                                    {calculations.shippingFee > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm border border-amber-100 dark:border-amber-800">
                                            <p className="text-amber-700 dark:text-amber-400">
                                                <strong>Free shipping</strong> on orders over $50!
                                                Add ${(50 - calculations.subtotal).toFixed(2)} more.
                                            </p>
                                        </div>
                                    )}

                                    {/* Trust Badges */}
                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="text-center">
                                            <ShieldCheck className="h-5 w-5 mx-auto text-green-500 mb-1" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Secure</span>
                                        </div>
                                        <div className="text-center">
                                            <Truck className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Fast Delivery</span>
                                        </div>
                                        <div className="text-center">
                                            <Package className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Quality</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
