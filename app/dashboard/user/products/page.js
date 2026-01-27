"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    ShoppingBag,
    Search,
    Filter,
    Grid3X3,
    List,
    Loader2,
    Heart,
    Star,
    X,
    SlidersHorizontal,
    Package
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";

const CATEGORIES = ["All", "Wedding", "Party", "Casual", "Formal"];
const PRODUCT_TYPES = [
    { value: "all", label: "All Types" },
    { value: "READY_TO_WEAR", label: "Ready to Wear" },
    { value: "STITCHED", label: "Stitched" },
    { value: "UNSTITCHED", label: "Unstitched" }
];
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" }
];

export default function CustomerProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [productType, setProductType] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;

            const params = new URLSearchParams({
                page: currentPage,
                limit: 12,
                sort: sortBy
            });

            if (searchQuery) params.append("search", searchQuery);
            if (category !== "All") params.append("category", category);
            if (productType !== "all") params.append("type", productType);
            if (priceRange.min) params.append("minPrice", priceRange.min);
            if (priceRange.max) params.append("maxPrice", priceRange.max);

            const res = await axios.get(`/api/products?${params.toString()}`);
            const newProducts = res.data?.data || [];

            if (reset) {
                setProducts(newProducts);
                setPage(1);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }

            setHasMore(newProducts.length === 12);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, category, productType, sortBy, priceRange]);

    useEffect(() => {
        fetchProducts(true);
    }, [category, productType, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(true);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setCategory("All");
        setProductType("all");
        setSortBy("newest");
        setPriceRange({ min: "", max: "" });
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
        fetchProducts();
    };

    const hasActiveFilters = category !== "All" || productType !== "all" || searchQuery || priceRange.min || priceRange.max;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <ShoppingBag className="h-8 w-8" />
                        <h1 className="text-2xl md:text-4xl font-bold">Browse Products</h1>
                    </div>
                    <p className="text-orange-100 text-sm md:text-base max-w-2xl">
                        Discover the latest fashion trends from our curated collection of clothing and accessories.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Select */}
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort Select */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Extended Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Select value={productType} onValueChange={setProductType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Product Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRODUCT_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            />
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            />

                            {hasActiveFilters && (
                                <Button variant="ghost" onClick={clearFilters} className="text-orange-600">
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {category !== "All" && (
                            <Badge variant="secondary" className="gap-1">
                                {category}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory("All")} />
                            </Badge>
                        )}
                        {productType !== "all" && (
                            <Badge variant="secondary" className="gap-1">
                                {PRODUCT_TYPES.find(t => t.value === productType)?.label}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setProductType("all")} />
                            </Badge>
                        )}
                        {searchQuery && (
                            <Badge variant="secondary" className="gap-1">
                                "{searchQuery}"
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                            </Badge>
                        )}
                    </div>
                )}

                {/* View Mode Toggle (Desktop) */}
                <div className="hidden md:flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">
                        {products.length} products found
                    </p>
                    <div className="flex gap-1 border rounded-lg p-1">
                        <Button
                            size="sm"
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === "list" ? "default" : "ghost"}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Products Grid */}
                {loading && products.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No products found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Try adjusting your filters or search query
                        </p>
                        {hasActiveFilters && (
                            <Button variant="link" onClick={clearFilters} className="mt-4 text-orange-600">
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-4 ${viewMode === "grid"
                            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                            : "grid-cols-1"
                            }`}>
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} viewMode={viewMode} />
                            ))}
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="min-w-40"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function ProductCard({ product, viewMode }) {
    const [liked, setLiked] = useState(false);

    if (viewMode === "list") {
        return (
            <Card className="overflow-hidden hover:shadow-lg transition-all">
                <div className="flex">
                    <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 shrink-0">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-300" />
                            </div>
                        )}
                    </div>
                    <CardContent className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                                <p className="text-sm text-gray-500">{product.category}</p>
                                {product.shop && (
                                    <Link href={`/shops/${product.shop._id}`} className="inline-flex items-center gap-2 mt-2 group">
                                        {product.shop.logo && (
                                            <img
                                                src={product.shop.logo}
                                                alt={product.shop.name}
                                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                            />
                                        )}
                                        <span className="text-sm font-medium text-orange-600 group-hover:text-orange-700 group-hover:underline">
                                            {product.shop.name}
                                        </span>
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => setLiked(!liked)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-bold text-orange-600">
                                ${product.basePrice?.toFixed(2)}
                            </span>
                            <Link href={`/products/${product._id}`}>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                    View Details
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge variant="secondary" className="text-xs">
                        {product.type?.replace(/_/g, " ")}
                    </Badge>
                </div>

                {/* Like Button */}
                <button
                    onClick={() => setLiked(!liked)}
                    className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                    <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/products/${product._id}`}>
                        <Button size="sm" variant="secondary">
                            Quick View
                        </Button>
                    </Link>
                </div>
            </div>

            <CardContent className="p-3">
                <h3 className="font-medium text-gray-900 line-clamp-1 text-sm">{product.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                {product.shop && (
                    <Link href={`/shops/${product.shop._id}`} className="inline-flex items-center gap-1.5 mt-1.5 group">
                        {product.shop.logo && (
                            <img
                                src={product.shop.logo}
                                alt={product.shop.name}
                                className="w-4 h-4 rounded-full object-cover border border-gray-200"
                            />
                        )}
                        <span className="text-xs font-medium text-orange-600 group-hover:text-orange-700 truncate">
                            {product.shop.name}
                        </span>
                    </Link>
                )}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-orange-600">
                        ${product.basePrice?.toFixed(2)}
                    </span>
                    {product.stock > 0 ? (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            In Stock
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                            Out of Stock
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
