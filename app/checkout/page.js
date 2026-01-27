"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "react-toastify";
import axios from "axios";
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

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/user/login?redirect=/checkout");
        }
    }, [status, router]);

    // Pre-fill shipping info from session
    useEffect(() => {
        if (session?.user) {
            setShippingInfo(prev => ({
                ...prev,
                fullName: session.user.name || "",
            }));
        }
    }, [session]);

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
        if (!validateShipping()) return;
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setLoading(true);
        try {
            // Group items by shop for multi-shop orders
            const orderItems = cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
                selectedOptions: item.selectedOptions || {}
            }));

            const response = await axios.post("/api/orders", {
                items: orderItems,
                shippingAddress: shippingInfo,
                subtotal: calculations.subtotal,
                shippingFee: calculations.shippingFee,
                tax: calculations.tax,
                totalAmount: calculations.total
            });

            if (response.data.success) {
                setOrderCreated(response.data.data);
                setStep(3);
                toast.success("Order created! Proceeding to payment...");
            }
        } catch (error) {
            console.error("Order creation error:", error);
            toast.error(error.response?.data?.error || "Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        clearCart();
        router.push(`/dashboard/user?tab=orders`);
        toast.success("Payment successful! Your order is being processed.");
    };

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
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
                        <ShoppingCart className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                        <p className="text-gray-500 mb-6">Add some products to your cart to proceed with checkout.</p>
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:py-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <Link href="/dashboard/user" className="p-2 hover:bg-white rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="text-sm text-gray-500 mt-1">{cartCount} items in your cart</p>
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
                                : "bg-gray-200 text-gray-500"
                                }`}>
                                {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={`ml-2 text-sm font-medium hidden sm:inline ${step >= s.num ? "text-indigo-600" : "text-gray-400"
                                }`}>
                                {s.label}
                            </span>
                            {idx < 2 && (
                                <ChevronRight className={`mx-2 sm:mx-4 h-4 w-4 ${step > s.num ? "text-indigo-600" : "text-gray-300"
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
                                    <Card className="border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                                                Review Your Items
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {cart.map((item, index) => (
                                                <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                                                    {/* Product Image */}
                                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                                        {item.product?.images?.[0] ? (
                                                            <Image
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Package className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                            {item.product?.name || "Product"}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {item.product?.shop?.name || "Shop"}
                                                        </p>
                                                        <p className="text-indigo-600 font-bold mt-1">
                                                            ${(item.product?.basePrice || 0).toFixed(2)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button
                                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                                disabled={cartLoading || item.quantity <= 1}
                                                                className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="w-6 text-center font-medium text-sm">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                                                disabled={cartLoading}
                                                                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
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
                                                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <p className="font-bold text-gray-900">
                                                            ${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                onClick={() => setStep(2)}
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
                                    <Card className="border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-indigo-600" />
                                                Shipping Information
                                            </CardTitle>
                                            <CardDescription>Enter your delivery address</CardDescription>
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
                                                        className="mt-1"
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
                                                        className="mt-1"
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
                                                    className="mt-1"
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
                                                        className="mt-1"
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
                                                        className="mt-1"
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
                                                        className="mt-1"
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
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setStep(1)}
                                                    className="flex-1"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Back
                                                </Button>
                                                <Button
                                                    onClick={handleCreateOrder}
                                                    disabled={loading}
                                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Creating Order...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Proceed to Payment
                                                            <ChevronRight className="ml-2 h-4 w-4" />
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
                                    <Card className="border-0 shadow-lg">
                                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <CardTitle>Order Created Successfully!</CardTitle>
                                                    <CardDescription>
                                                        Order ID: {orderCreated._id?.slice(-8).toUpperCase()}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="bg-indigo-50 p-4 rounded-xl">
                                                <div className="flex items-center gap-2 text-indigo-700 mb-2">
                                                    <CreditCard className="h-5 w-5" />
                                                    <span className="font-semibold">Payment Options</span>
                                                </div>
                                                <p className="text-sm text-indigo-600">
                                                    Complete your payment to confirm the order.
                                                </p>
                                            </div>

                                            {/* Payment Methods */}
                                            <div className="space-y-3">
                                                <Button
                                                    onClick={handlePaymentSuccess}
                                                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base"
                                                >
                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                    Pay ${calculations.total.toFixed(2)}
                                                </Button>

                                                <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
                                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                                    <span>Secure payment - Your data is protected</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push("/dashboard/user?tab=orders")}
                                                    className="w-full"
                                                >
                                                    Pay Later - View My Orders
                                                </Button>
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
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 space-y-4">
                                    {/* Items Summary */}
                                    <div className="space-y-3 max-h-48 overflow-y-auto">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600 truncate max-w-[150px]">
                                                    {item.product?.name} × {item.quantity}
                                                </span>
                                                <span className="font-medium">
                                                    ${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">${calculations.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <Truck className="h-3 w-3" /> Shipping
                                            </span>
                                            <span className={calculations.shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                                                {calculations.shippingFee === 0 ? "FREE" : `$${calculations.shippingFee.toFixed(2)}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax (5%)</span>
                                            <span className="font-medium">${calculations.tax.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-indigo-600">
                                                ${calculations.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Free Shipping Notice */}
                                    {calculations.shippingFee > 0 && (
                                        <div className="bg-amber-50 p-3 rounded-lg text-sm">
                                            <p className="text-amber-700">
                                                <strong>Free shipping</strong> on orders over $50!
                                                Add ${(50 - calculations.subtotal).toFixed(2)} more.
                                            </p>
                                        </div>
                                    )}

                                    {/* Trust Badges */}
                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                                        <div className="text-center">
                                            <ShieldCheck className="h-5 w-5 mx-auto text-green-500 mb-1" />
                                            <span className="text-xs text-gray-500">Secure</span>
                                        </div>
                                        <div className="text-center">
                                            <Truck className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                                            <span className="text-xs text-gray-500">Fast Delivery</span>
                                        </div>
                                        <div className="text-center">
                                            <Package className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                                            <span className="text-xs text-gray-500">Quality</span>
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
