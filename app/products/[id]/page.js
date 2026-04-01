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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Package className="h-16 w-16 text-gray-300" />
                <h2 className="text-xl font-medium text-gray-600">Product not found</h2>
                <Link href="/dashboard/user/products">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </Link>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : [null];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="container mx-auto px-4 py-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900"
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
                        <div className="aspect-square bg-white rounded-2xl border overflow-hidden">
                            {images[selectedImage] ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-24 w-24 text-gray-300" />
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
                                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${selectedImage === idx ? 'border-orange-500' : 'border-gray-200'
                                            }`}
                                    >
                                        {img ? (
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-300" />
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
                                    <Badge variant="secondary" className="mb-2">
                                        {product.type?.replace(/_/g, " ")}
                                    </Badge>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        {product.title}
                                    </h1>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleToggleWishlist}
                                        disabled={wishlistLoading}
                                    >
                                        {wishlistLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                        ) : (
                                            <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                                        )}
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-gray-500 mt-1">{product.category}</p>

                            {product.shop?.name && (
                                <p className="text-sm text-gray-400 mt-1">
                                    Sold by <span className="text-orange-600 font-medium">{product.shop.name}</span>
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-bold text-orange-600">
                                ${product.basePrice?.toFixed(2)}
                            </span>
                            {product.stock > 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    <Check className="h-3 w-3 mr-1" />
                                    In Stock ({product.stock})
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Quantity</h3>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                    disabled={quantity >= (product.stock || 10)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-lg"
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
                                className="flex-1 h-12 text-lg border-orange-600 text-orange-600 hover:bg-orange-50"
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
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="h-5 w-5 text-orange-500" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield className="h-5 w-5 text-orange-500" />
                                <span>Secure Payment</span>
                            </div>
                        </div>

                        {/* Attributes */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="font-medium text-gray-900 mb-3">Product Details</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.attributes.color && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Color</span>
                                            <span className="font-medium">{product.attributes.color}</span>
                                        </div>
                                    )}
                                    {product.attributes.fabric && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Fabric</span>
                                            <span className="font-medium">{product.attributes.fabric}</span>
                                        </div>
                                    )}
                                    {product.attributes.pattern && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Pattern</span>
                                            <span className="font-medium">{product.attributes.pattern}</span>
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
