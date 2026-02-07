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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="h-8 w-8 text-white/90" />
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Discover Shops</h1>
                    </div>
                    <p className="text-orange-50 text-sm md:text-base max-w-2xl font-medium">
                        Browse our curated collection of fashion shops offering the latest trends.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 max-w-md mx-auto sm:mx-0">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        <Input
                            placeholder="Search shops by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                ) : filteredShops.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Store className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No shops found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {searchQuery ? "Try a different search term" : "No shops are currently available"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredShops.map((shop) => (
                            <Link key={shop._id} href={`/shops/${shop._id}`}>
                                <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                    <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-400 relative overflow-hidden">
                                        {shop.banner && (
                                            <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                    </div>
                                    <CardContent className="p-5 relative pt-12">
                                        <div className="absolute -top-10 left-5">
                                            {shop.logo ? (
                                                <img src={shop.logo} alt={shop.name} className="w-20 h-20 rounded-xl object-cover border-4 border-white dark:border-gray-900 shadow-lg bg-white dark:bg-gray-800" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg">
                                                    <Store className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                            {shop.name}
                                        </h3>
                                        {shop.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">{shop.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto">
                                            {shop.location?.city && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{shop.location.city}, {shop.location.state}</span>
                                                </div>
                                            )}
                                            {shop.ratingCount > 0 && (
                                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/30">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{shop.ratingAvg?.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {shop.categoryPermissions?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                {shop.categoryPermissions.slice(0, 3).map((category, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 h-5 font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                                        {category}
                                                    </Badge>
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
