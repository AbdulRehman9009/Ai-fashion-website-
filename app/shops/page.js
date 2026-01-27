"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Store, Search, MapPin, Star, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";

export default function ShopsPage() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/shops");
            setShops(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch shops:", error);
            toast.error("Failed to load shops");
        } finally {
            setLoading(false);
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="h-8 w-8" />
                        <h1 className="text-2xl md:text-4xl font-bold">Discover Shops</h1>
                    </div>
                    <p className="text-orange-100 text-sm md:text-base max-w-2xl">
                        Browse our curated collection of fashion shops offering the latest trends.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search shops by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                ) : filteredShops.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border">
                        <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No shops found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchQuery ? "Try a different search term" : "No shops are currently available"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredShops.map((shop) => (
                            <Link key={shop._id} href={`/shops/${shop._id}`}>
                                <Card className="overflow-hidden hover:shadow-lg transition-all h-full group">
                                    <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-400 relative">
                                        {shop.banner && (
                                            <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                    </div>
                                    <CardContent className="p-4 relative">
                                        <div className="-mt-12 mb-3">
                                            {shop.logo ? (
                                                <img src={shop.logo} alt={shop.name} className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                                                    <Store className="h-10 w-10 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {shop.name}
                                        </h3>
                                        {shop.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shop.description}</p>
                                        )}
                                        {shop.location?.city && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                                <MapPin className="h-3 w-3" />
                                                <span>{shop.location.city}, {shop.location.state}</span>
                                            </div>
                                        )}
                                        {shop.ratingCount > 0 && (
                                            <div className="flex items-center gap-1 mb-3">
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                <span className="text-sm font-medium text-gray-900">{shop.ratingAvg?.toFixed(1)}</span>
                                                <span className="text-xs text-gray-500">({shop.ratingCount})</span>
                                            </div>
                                        )}
                                        {shop.categoryPermissions?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {shop.categoryPermissions.slice(0, 3).map((category, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">{category}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
