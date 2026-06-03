"use client";
import { useMemo } from "react";
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getProductImage } from "@/lib/productImages";

export default function CartSidebar({ isOpen, onClose }) {
    const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, loading } = useCart();
    const router = useRouter();

    const calculations = useMemo(() => {
        const subtotal = cartTotal || 0;
        const shippingFee = subtotal > 50 ? 0 : subtotal > 0 ? 8 : 0; // Free shipping over $50
        const tax = subtotal * 0.05;
        const total = subtotal + shippingFee + tax;
        return { subtotal, shippingFee, tax, total };
    }, [cartTotal]);

    const handleCheckout = () => {
        onClose();
        router.push("/checkout");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full sm:h-[calc(100vh-2rem)] sm:top-4 sm:right-4 sm:rounded-2xl w-full sm:w-[400px] bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-2xl z-50 flex flex-col overflow-hidden border-l sm:border border-gray-200/50 dark:border-gray-800/50"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                    <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
                                    <p className="text-sm text-gray-500">{cartCount} items</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <ShoppingCart className="h-20 w-20 mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Your cart is empty</p>
                                    <p className="text-sm">Start shopping to add items!</p>
                                </div>
                            ) : (
                                cart.map((item, index) => {
                                    const productId = item.product?._id || item.product?.id;
                                    const selectedOptions = item.selectedOptions || {};
                                    const productImage = getProductImage(item.product);

                                    return (
                                    <motion.div
                                        key={`${productId || index}-${JSON.stringify(selectedOptions)}`}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="flex gap-4 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all group"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <Image
                                                src={productImage}
                                                alt={item.product?.title || "Product image"}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                                                {item.product?.title || item.product?.name || "Product"}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {item.product?.shop?.name || "Shop"}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                    ${(item.product?.basePrice || 0).toFixed(2)}
                                                </p>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    = ${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-900/50 rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(productId, item.quantity - 1, selectedOptions)}
                                                        disabled={loading || item.quantity <= 1}
                                                        className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md disabled:opacity-50 transition-all shadow-sm"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-6 text-center font-medium text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(productId, item.quantity + 1, selectedOptions)}
                                                        disabled={loading}
                                                        className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all shadow-sm"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                    <button
                                                        onClick={() => removeFromCart(productId, selectedOptions)}
                                                        disabled={loading}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer with Total */}
                        {cart.length > 0 && (
                            <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-5 space-y-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                                {/* Price Breakdown */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">${calculations.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <Truck className="h-3 w-3" /> Shipping
                                        </span>
                                        <span className={calculations.shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                                            {calculations.shippingFee === 0 ? "FREE" : `$${calculations.shippingFee.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Tax (5%)</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">${calculations.tax.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Free Shipping Notice */}
                                {calculations.shippingFee > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                                        Add ${(50 - calculations.subtotal).toFixed(2)} more for <strong>FREE shipping!</strong>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        ${calculations.total.toFixed(2)}
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    className="w-full relative overflow-hidden group bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Proceed to Checkout
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
