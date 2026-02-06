"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Store, Package, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";

export default function WishlistTab() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/wishlist");
            setWishlist(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
            toast.error("Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            setRemovingId(productId);
            await axios.delete(`/api/wishlist?productId=${productId}`);
            setWishlist((prev) => prev.filter((item) => item.product?._id !== productId));
            toast.success("Removed from wishlist");
        } catch (error) {
            console.error("Failed to remove from wishlist:", error);
            toast.error("Failed to remove item");
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg dark:bg-gray-900">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border-b dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-100 dark:bg-pink-900/50 p-2 rounded-lg">
                            <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">My Wishlist</CardTitle>
                            <CardDescription>
                                {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {wishlist.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Your wishlist is empty</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 mb-4">
                                Browse shops and add products you love!
                            </p>
                            <Link href="/shops">
                                <Button className="bg-pink-600 hover:bg-pink-700">
                                    <Store className="h-4 w-4 mr-2" />
                                    Browse Shops
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {wishlist.map((item) => {
                                const product = item.product;
                                if (!product) return null;

                                return (
                                    <Card
                                        key={product._id}
                                        className="overflow-hidden group hover:shadow-lg transition-all border-2 hover:border-pink-200"
                                    >
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => removeFromWishlist(product._id)}
                                                disabled={removingId === product._id}
                                                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                                title="Remove from wishlist"
                                            >
                                                {removingId === product._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                )}
                                            </button>
                                        </div>
                                        <CardContent className="p-4">
                                            <Link href={`/products/${product._id}`}>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                                                    {product.title}
                                                </h3>
                                            </Link>
                                            {product.shop && (
                                                <Link href={`/shops/${product.shop._id}`}>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                                                        {product.shop.logo ? (
                                                            <img
                                                                src={product.shop.logo}
                                                                alt={product.shop.name}
                                                                className="w-4 h-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <Store className="h-4 w-4" />
                                                        )}
                                                        <span className="line-clamp-1">{product.shop.name}</span>
                                                    </div>
                                                </Link>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-lg font-bold text-pink-600">
                                                    ${product.basePrice?.toFixed(2)}
                                                </span>
                                                <Link href={`/products/${product._id}`}>
                                                    <Button size="sm" variant="outline" className="gap-1">
                                                        <ShoppingBag className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
