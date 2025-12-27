"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const addToCart = (product) => {
        setCart([...cart, { ...product, cartId: Date.now() }]);
        toast.success("Added to cart");
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const proceedToCheckout = async () => {
        if (cart.length === 0) return;

        // For MVP, we'll create a single order for simplicity, 
        // or arguably one order per shop, but let's assume single shop or mixed is fine 
        // and backend splits it or we just send it all.
        // The current backend (CheckoutDialog) handles single item order.
        // We need to upgrade backend to handle cart or loop through items. 
        // Let's implement robust single-order creation for now or bulk if supported.
        // Looking at `api/orders/route.js`: "items" is an array. So it supports bulk!
        // But it takes `shopId`. If cart has multiple shops, we need to split.
        // Let's assume all products from one shop for now or handle split. 
        // To keep it simple for this "production upgrade", let's group by shop.

        // Checking shop IDs
        const shopIds = [...new Set(cart.map(p => p.shop))];
        if (shopIds.length > 1) {
            toast.info("Creating separate orders for different shops...");
        }

        try {
            for (const shopId of shopIds) {
                const shopItems = cart.filter(p => p.shop === shopId);
                const payload = {
                    items: shopItems.map(p => ({ productId: p._id, quantity: 1 })),
                    shopId: shopId,
                    tailoringRequests: [], // Customization step could be added here
                    urgent: false,
                    shippingAddress: { street: "Default Address" } // Should be from a form
                };

                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to place order for a shop");
            }
            toast.success("All orders placed successfully!");
            setCart([]);
            router.push("/dashboard/user/orders");
        } catch (e) {
            toast.error(e.message);
        }
    };

    const total = cart.reduce((acc, item) => acc + item.basePrice, 0);

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Order</h2>
                    <p className="text-gray-500">Select items to purchase.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 w-[200px] md:w-[300px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-6 h-full">
                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <Card key={product._id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                                    <div className="aspect-square bg-gray-100 relative">
                                        {/* Placeholder Image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                        {product.imageUrl && <img src={product.imageUrl} className="object-cover w-full h-full" />}
                                    </div>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg">{product.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                                        <span className="font-bold text-lg">${product.basePrice}</span>
                                        <Button size="sm" onClick={() => addToCart(product)}>Add</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Sidebar */}
                <div className="w-[350px] bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart</h3>
                        <span className="text-sm bg-gray-200 px-2 py-0.5 rounded-full">{cart.length} items</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                Your cart is empty
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartId} className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-500">${item.basePrice}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => removeFromCart(item.cartId)}>×</Button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 border-t space-y-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full" onClick={proceedToCheckout} disabled={cart.length === 0}>
                            Checkout <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
