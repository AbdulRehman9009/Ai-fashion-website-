"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    Heart,
    Star,
    Truck,
    Shield,
    ArrowLeft,
    Loader2,
    Package,
    Minus,
    Plus,
    Share2,
    Check
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchProduct();
            fetchWishlistStatus();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/products/${params.id}`);
            setProduct(res.data.data || res.data);
        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error("Product not found");
            router.push("/dashboard/user/products");
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlistStatus = async () => {
        try {
            const res = await axios.get("/api/wishlist");
            const wishlistItems = res.data.data || [];
            const isLiked = wishlistItems.some(item => 
                (item.product?._id || item.product) === params.id
            );
            setLiked(isLiked);
        } catch (error) {
            console.error("Failed to fetch wishlist status:", error);
        }
    };

    const handleToggleWishlist = async () => {
        if (wishlistLoading) return;
        
        setWishlistLoading(true);
        try {
            if (liked) {
                // Remove from wishlist
                const res = await axios.delete(`/api/wishlist?productId=${params.id}`);
                if (res.data.success) {
                    setLiked(false);
                    toast.success("Removed from wishlist");
                }
            } else {
                // Add to wishlist
                const res = await axios.post("/api/wishlist", { productId: params.id });
                if (res.data.success) {
                    setLiked(true);
                    toast.success("Added to wishlist");
                }
            }
        } catch (error) {
            console.error("Wishlist error:", error);
            if (error.response?.status === 401) {
                toast.error("Please login to use wishlist");
            } else {
                toast.error(error.response?.data?.error || "Failed to update wishlist");
            }
        } finally {
            setWishlistLoading(false);
        }
    };

    const { addToCart } = useCart();

    const handleAddToCart = async () => {
        console.log("Add to Cart clicked", { productId: product._id, quantity });
        setAddingToCart(true);
        try {
            const success = await addToCart(product._id, quantity);
            console.log("Add to Cart result:", success);
            if (!success) {
                // Context already shows error toast, but log for debugging
                console.error("Failed to add to cart - returned false");
            }
        } catch (error) {
            console.error("Add to Cart exception:", error);
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        setAddingToCart(true);
        try {
            const success = await addToCart(product._id, quantity);
            if (success) {
                router.push('/checkout');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
                <Package className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                <h2 className="text-xl font-medium text-slate-600 dark:text-slate-400">Product not found</h2>
                <Link href="/dashboard/user/products">
                    <Button variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </Link>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : [null];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Back Button */}
            <div className="container mx-auto px-4 py-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            {images[selectedImage] ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${selectedImage === idx ? 'border-orange-500' : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                    >
                                        {img ? (
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <Badge variant="secondary" className="mb-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 font-normal">
                                        {product.type?.replace(/_/g, " ")}
                                    </Badge>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                        {product.title}
                                    </h1>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleToggleWishlist}
                                        disabled={wishlistLoading}
                                        className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        {wishlistLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                        ) : (
                                            <Heart className={`h-4 w-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                                        )}
                                    </Button>
                                    <Button variant="outline" size="icon" className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 mt-1">{product.category}</p>

                            {product.shop?.name && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                    Sold by <span className="text-orange-600 dark:text-orange-400 font-medium">{product.shop.name}</span>
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-500">
                                ${product.basePrice?.toFixed(2)}
                            </span>
                            {product.stock > 0 ? (
                                <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10 font-medium">
                                    <Check className="h-3 w-3 mr-1" />
                                    In Stock ({product.stock})
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10 font-medium">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Description</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Quantity</h3>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium text-lg text-slate-900 dark:text-white">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                    disabled={quantity >= (product.stock || 10)}
                                    className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-lg shadow-md hover:shadow-lg transition-all border-0"
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.stock === 0}
                            >
                                {addingToCart ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                )}
                                Add to Cart
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-12 text-lg border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                onClick={handleBuyNow}
                                disabled={addingToCart || product.stock === 0}
                            >
                                {addingToCart ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : null}
                                Buy Now
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Truck className="h-5 w-5 text-orange-500" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Shield className="h-5 w-5 text-orange-500" />
                                <span>Secure Payment</span>
                            </div>
                        </div>

                        {/* Attributes */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Product Details</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.attributes.color && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Color</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{product.attributes.color}</span>
                                        </div>
                                    )}
                                    {product.attributes.fabric && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Fabric</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{product.attributes.fabric}</span>
                                        </div>
                                    )}
                                    {product.attributes.pattern && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Pattern</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{product.attributes.pattern}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
