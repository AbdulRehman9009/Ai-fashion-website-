"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Star, Package, Loader2, Phone, Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";
import BackButton from "@/components/navigation/BackButton";
import { useCart } from "@/contexts/CartContext";

export default function ShopProfilePage() {
    const params = useParams();
    const shopId = params.id;
    const { addToCart, loading: cartLoading } = useCart();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState(new Set());
    const [wishlistLoading, setWishlistLoading] = useState(new Set());

    useEffect(() => {
        if (shopId) {
            fetchShopData();
            fetchWishlist();
        }
    }, [shopId]);

    const fetchShopData = async () => {
        try {
            setLoading(true);
            const [shopRes, productsRes] = await Promise.all([
                axios.get(`/api/shops/${shopId}`),
                axios.get(`/api/products?shop=${shopId}`)
            ]);
            setShop(shopRes.data);
            setProducts(productsRes.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch shop data:", error);
            toast.error("Failed to load shop information");
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            const res = await axios.get("/api/wishlist");
            const wishlistIds = new Set(
                (res.data?.data || []).map(item => item.product?._id).filter(Boolean)
            );
            setWishlist(wishlistIds);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        }
    };

    const toggleWishlist = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        if (wishlistLoading.has(productId)) return;

        setWishlistLoading(prev => new Set([...prev, productId]));

        try {
            if (wishlist.has(productId)) {
                await axios.delete(`/api/wishlist?productId=${productId}`);
                setWishlist(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
                toast.success("Removed from wishlist");
            } else {
                await axios.post("/api/wishlist", { productId });
                setWishlist(prev => new Set([...prev, productId]));
                toast.success("Added to wishlist");
            }
            // Refresh wishlist to ensure consistency
            await fetchWishlist();
        } catch (error) {
            const message = error.response?.data?.error || "Failed to update wishlist";
            toast.error(message);
        } finally {
            setWishlistLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const handleAddToCart = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        await addToCart(productId, 1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Shop Not Found</h2>
                    <p className="text-gray-500 mb-4">The shop you are looking for does not exist.</p>
                    <Link href="/dashboard/user">
                        <Button className="bg-orange-600 hover:bg-orange-700">Go to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative h-64 bg-gradient-to-r from-orange-500 to-pink-500">
                {shop.banner && <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="container mx-auto px-4 py-4">
                <BackButton />
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                {shop.logo ? (
                                    <img src={shop.logo} alt={shop.name} className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg" />
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                                        <Store className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
                                        {shop.location?.city && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{shop.location.city}, {shop.location.state}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant={shop.isActive ? "default" : "secondary"} className="text-sm">
                                        {shop.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                {shop.description && <p className="text-gray-600 mb-4">{shop.description}</p>}
                                {shop.ratingCount > 0 && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold text-gray-900">{shop.ratingAvg?.toFixed(1)}</span>
                                        <span className="text-sm text-gray-500">({shop.ratingCount} reviews)</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-4">
                                    {shop.businessDetails?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{shop.businessDetails.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                        <span className="text-sm text-gray-500">{products.length} items</span>
                    </div>

                    {products.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No Products Available</h3>
                            <p className="text-sm text-gray-500">This shop has not listed any products yet.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map((product) => (
                                <Card key={product._id} className="overflow-hidden group hover:shadow-lg transition-all">
                                    <Link href={`/products/${product._id}`}>
                                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-12 w-12 text-gray-300" />
                                                </div>
                                            )}
                                            <Badge className="absolute top-2 left-2 text-xs">{product.type?.replace(/_/g, " ")}</Badge>

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => toggleWishlist(e, product._id)}
                                                disabled={wishlistLoading.has(product._id)}
                                                className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all ${wishlist.has(product._id)
                                                    ? "bg-pink-500 text-white hover:bg-pink-600"
                                                    : "bg-white/90 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                                                    } disabled:opacity-50`}
                                                title={wishlist.has(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                                            >
                                                {wishlistLoading.has(product._id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Heart className={`h-4 w-4 ${wishlist.has(product._id) ? "fill-current" : ""}`} />
                                                )}
                                            </button>
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-medium text-gray-900 line-clamp-1 text-sm">{product.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-lg font-bold text-orange-600">${product.basePrice?.toFixed(2)}</span>
                                                <Badge variant="outline" className={`text-xs ${product.stock > 0 ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}`}>
                                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                                </Badge>
                                            </div>
                                            {/* Add to Cart Button */}
                                            <Button
                                                size="sm"
                                                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                                disabled={product.stock <= 0 || cartLoading}
                                                onClick={(e) => handleAddToCart(e, product._id)}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                Add to Cart
                                            </Button>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
