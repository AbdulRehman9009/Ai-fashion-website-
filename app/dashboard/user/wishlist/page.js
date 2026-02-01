"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, ShoppingBag, Loader2, Package } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

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
            await axios.delete(`/api/wishlist?productId=${productId}`);
            toast.success("Removed from wishlist");
            fetchWishlist();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to remove item");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="bg-pink-100 dark:bg-pink-900/30 p-2 sm:p-3 rounded-full">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Wishlist</h2>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                        {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                    </p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <Card className="p-12 text-center">
                    <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Your wishlist is empty</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start adding products you love to your wishlist</p>
                    <Link href="/dashboard/user/products">
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Browse Products
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlist.map((item) => {
                        const product = item.product;
                        if (!product) return null;
                        return (
                            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                                    <Link href={`/products/${product._id}`}>
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-12 w-12 text-gray-300" />
                                            </div>
                                        )}
                                    </Link>
                                    <button onClick={() => removeFromWishlist(product._id)} className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md" title="Remove from wishlist">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </button>
                                    <Badge className="absolute top-2 left-2" variant="secondary">{product.type?.replace(/_/g, " ")}</Badge>
                                </div>
                                <CardContent className="p-4">
                                    <Link href={`/products/${product._id}`}>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{product.title}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>
                                    {product.shop && (
                                        <Link href={`/shops/${product.shop._id}`} className="inline-flex items-center gap-1.5 mt-2 group/shop">
                                            {product.shop.logo && <img src={product.shop.logo} alt={product.shop.name} className="w-4 h-4 rounded-full object-cover border border-gray-200" />}
                                            <span className="text-xs font-medium text-orange-600 group-hover/shop:text-orange-700 truncate">{product.shop.name}</span>
                                        </Link>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-lg font-bold text-orange-600">${product.basePrice?.toFixed(2)}</span>
                                        <Badge variant="outline" className={`text-xs ${product.stock > 0 ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}`}>
                                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                        </Badge>
                                    </div>
                                    <Link href={`/products/${product._id}`} className="block mt-3">
                                        <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">View Details</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
