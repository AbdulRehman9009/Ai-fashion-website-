"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Star, Package, Loader2, Phone, Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";
import BackButton from "@/components/navigation/BackButton";
import { useCart } from "@/contexts/CartContext";
import { getProductImage, PRODUCT_IMAGE_FALLBACK, useProductImageFallback } from "@/lib/productImages";

export default function ShopProfilePage() {
    const params = useParams();
    const router = useRouter();
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-500 to-pink-500 overflow-hidden">
                {shop.banner && <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="container mx-auto px-4 py-4">
                <BackButton className="text-white hover:bg-white/20 hover:text-white" />
            </div>

            <div className="container mx-auto px-4 -mt-24 relative z-10 pb-12">
                <Card className="mb-8 overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 md:p-8 flex-shrink-0 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                                <div className="-mt-16 md:-mt-20 mb-4 relative z-10">
                                    {shop.logo ? (
                                        <img src={shop.logo} alt={shop.name} className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-white dark:bg-slate-800" />
                                    ) : (
                                        <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                                            <Store className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{shop.name}</h1>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                        <Badge variant={shop.isActive ? "default" : "secondary"} className={`${shop.isActive ? "bg-green-500 hover:bg-green-600" : ""} border-none`}>
                                            {shop.isActive ? "Active" : "Temporarily Closed"}
                                        </Badge>
                                        {shop.location?.city && (
                                            <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-normal">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {shop.location.city}, {shop.location.state}
                                            </Badge>
                                        )}
                                    </div>
                                    {shop.ratingCount > 0 && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800/30 inline-flex">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${star <= Math.round(shop.ratingAvg || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white ml-1">{shop.ratingAvg?.toFixed(1)}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">({shop.ratingCount} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/20">
                                <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Store className="h-4 w-4 text-orange-500" /> About the Shop
                                </h2>
                                {shop.description ? (
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{shop.description}</p>
                                ) : (
                                    <p className="text-slate-400 italic mb-6">No description available.</p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {shop.businessDetails?.phone && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Phone</div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{shop.businessDetails.phone}</div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Additional details could go here */}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Available Products
                            <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-2">
                                {products.length}
                            </span>
                        </h2>
                    </div>

                    {products.length === 0 ? (
                        <Card className="p-12 text-center bg-white dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Products Available</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                This shop hasn't listed any products usually. Check back later for new collections.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {products.map((product) => {
                                const productImage = getProductImage(product);
                                return (
                                <Card key={product._id} className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <Link href={`/products/${product._id}`} className="block h-full">
                                        <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                            <img
                                                src={productImage}
                                                alt={product.title || "Product image"}
                                                onError={useProductImageFallback}
                                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${productImage === PRODUCT_IMAGE_FALLBACK ? "p-8" : ""}`}
                                            />

                                            {/* Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <Badge className="absolute top-2 left-2 text-[10px] font-normal backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-sm border-0">
                                                {product.type?.replace(/_/g, " ")}
                                            </Badge>

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => toggleWishlist(e, product._id)}
                                                disabled={wishlistLoading.has(product._id)}
                                                className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all z-10 ${wishlist.has(product._id)
                                                    ? "bg-pink-500 text-white hover:bg-pink-600"
                                                    : "bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-500"
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
                                        <CardContent className="p-4">
                                            <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1 text-base mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{product.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{product.category}</p>

                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">${product.basePrice?.toFixed(2)}</span>
                                                <Badge variant="outline" className={`text-[10px] px-1.5 h-5 ${product.stock > 0
                                                    ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10"
                                                    : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10"}`}>
                                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                                </Badge>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full text-xs font-medium h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                                    disabled={product.stock <= 0 || cartLoading}
                                                    onClick={(e) => handleAddToCart(e, product._id)}
                                                >
                                                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                                    Add
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="w-full text-xs font-medium h-9 bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-md shadow-orange-500/20"
                                                    disabled={product.stock <= 0 || cartLoading}
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const success = await addToCart(product._id, 1);
                                                        if (success) {
                                                            router.push('/checkout');
                                                        }
                                                    }}
                                                >
                                                    Buy Now
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
