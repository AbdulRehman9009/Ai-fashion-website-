"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { data: session, status } = useSession();
    const [cart, setCart] = useState([]);
    const [cartShop, setCartShop] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const fetchingRef = useRef(false);
    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => {
            const price = item.product?.basePrice ?? item.product?.price ?? 0;
            return total + price * item.quantity;
        }, 0);
    }, [cart]);

    const fetchCart = useCallback(async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            const res = await fetch("/api/cart");
            if (!res.ok) return;
            const data = await res.json();
            setCart(data.data || []);
            setCartCount(data.count || 0);
            setCartShop(data.shop || null);
        } catch (error) {
            console.error("[CartContext] fetchCart:", error);
        } finally {
            fetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            fetchCart();
        } else if (status === "unauthenticated") {
            setCart([]);
            setCartCount(0);
            setCartShop(null);
        }
    }, [session, status, fetchCart]);

    const addToCart = useCallback(
        async (productId, quantity = 1, selectedOptions = {}) => {
            if (!session?.user) {
                toast.error("Please log in to add items to cart");
                return false;
            }

            // Optimistic update
            const prevCart = cart;
            const prevCount = cartCount;
            const prevShop = cartShop;

            const existingItemIndex = cart.findIndex(
                (item) =>
                    item.product?._id?.toString() === productId.toString() &&
                    JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions)
            );

            if (existingItemIndex > -1) {
                setCart((prev) =>
                    prev.map((item, idx) =>
                        idx === existingItemIndex
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    )
                );
            } else {
                setCartCount((prev) => prev + 1);
            }

            setLoading(true);
            try {
                const res = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, quantity, selectedOptions })
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success("Added to cart!");
                    setCart(data.data || []);
                    setCartCount(data.count || 0);
                    setCartShop(data.shop || null);
                    return true;
                }

                // Rollback if request fails
                setCart(prevCart);
                setCartCount(prevCount);
                setCartShop(prevShop);

                if (data.code === "MULTI_SHOP_ERROR") {
                    const shouldClear = window.confirm(
                        "Your cart has items from a different shop. Clear your cart and add this item instead?"
                    );
                    if (shouldClear) {
                        const clearRes = await fetch("/api/cart?clear=true", { method: "DELETE" });
                        if (clearRes.ok) {
                            setCart([]);
                            setCartCount(0);
                            setCartShop(null);
                            const retryRes = await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ productId, quantity, selectedOptions })
                            });
                            const retryData = await retryRes.json();
                            if (retryRes.ok) {
                                toast.success("Cart cleared and item added!");
                                setCart(retryData.data || []);
                                setCartCount(retryData.count || 0);
                                setCartShop(retryData.shop || null);
                                return true;
                            }
                        }
                        toast.error("Failed to clear cart. Please try again.");
                    }
                    return false;
                }

                if (data.code === "INSUFFICIENT_STOCK") {
                    toast.error(data.error || "Not enough stock available");
                } else {
                    toast.error(data.error || "Failed to add to cart");
                }
                return false;
            } catch (error) {
                // Rollback
                setCart(prevCart);
                setCartCount(prevCount);
                setCartShop(prevShop);

                console.error("[CartContext] addToCart:", error);
                toast.error("Failed to add to cart");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [session, cart, cartCount, cartShop]
    );

    const removeFromCart = useCallback(
        async (productId, selectedOptions = {}) => {
            if (!productId) return false;

            // Optimistic update
            const prevCart = cart;
            const prevCount = cartCount;
            const prevShop = cartShop;

            const newCart = cart.filter(
                (item) =>
                    !(
                        item.product?._id?.toString() === productId.toString() &&
                        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions)
                    )
            );
            setCart(newCart);
            setCartCount(newCart.length);
            if (newCart.length === 0) {
                setCartShop(null);
            }

            setLoading(true);
            try {
                const params = new URLSearchParams({ productId });
                if (Object.keys(selectedOptions).length > 0) {
                    params.set("selectedOptions", JSON.stringify(selectedOptions));
                }
                const res = await fetch(`/api/cart?${params}`, { method: "DELETE" });
                const data = await res.json();

                if (!res.ok) {
                    setCart(prevCart);
                    setCartCount(prevCount);
                    setCartShop(prevShop);
                    toast.error(data.error || "Failed to remove from cart");
                    return false;
                }

                setCart(data.data || []);
                setCartCount(data.count || 0);
                setCartShop(data.shop || null);
                toast.success("Removed from cart");
                return true;
            } catch (error) {
                setCart(prevCart);
                setCartCount(prevCount);
                setCartShop(prevShop);
                console.error("[CartContext] removeFromCart:", error);
                toast.error("Failed to remove from cart");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [cart, cartCount, cartShop]
    );

    const updateQuantity = useCallback(
        async (productId, quantity, selectedOptions = {}) => {
            if (quantity < 1) return false;

            // Optimistic update
            const prevCart = cart;
            setCart((prev) =>
                prev.map((item) =>
                    item.product?._id?.toString() === productId.toString() &&
                    JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions)
                        ? { ...item, quantity }
                        : item
                )
            );

            setLoading(true);
            try {
                const res = await fetch("/api/cart", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, quantity, selectedOptions })
                });

                const data = await res.json();

                if (!res.ok) {
                    setCart(prevCart); // rollback
                    toast.error(data.error || "Failed to update quantity");
                    return false;
                }

                setCart(data.data || []);
                setCartCount(data.count || 0);
                setCartShop(data.shop || null);
                return true;
            } catch (error) {
                setCart(prevCart);
                console.error("[CartContext] updateQuantity:", error);
                toast.error("Failed to update cart");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [cart]
    );

    const clearCart = useCallback(async () => {
        const prevCart = cart;
        const prevCount = cartCount;
        const prevShop = cartShop;

        setCart([]);
        setCartCount(0);
        setCartShop(null);
        try {
            const res = await fetch("/api/cart?clear=true", { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                setCart(prevCart);
                setCartCount(prevCount);
                setCartShop(prevShop);
                toast.error("Failed to clear cart");
            } else {
                setCart(data.data || []);
                setCartCount(data.count || 0);
                setCartShop(data.shop || null);
            }
        } catch (error) {
            setCart(prevCart);
            setCartCount(prevCount);
            setCartShop(prevShop);
            console.error("[CartContext] clearCart:", error);
        }
    }, [cart, cartCount, cartShop]);

    const getCartTotal = useCallback(
        (includeExtras = false) => {
            if (!includeExtras) return cartTotal;
            const shippingFee = cartTotal > 5000 ? 0 : 250;
            const tax = cartTotal * 0.05;
            return {
                subtotal: cartTotal,
                shipping: shippingFee,
                tax: Math.round(tax),
                total: Math.round(cartTotal + shippingFee + tax)
            };
        },
        [cartTotal]
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                cartTotal,
                cartShop,
                loading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refreshCart: fetchCart,
                getCartTotal
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
