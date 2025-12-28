"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Store, Search, Eye, EyeOff, Package, ShoppingCart, DollarSign,
    Loader2, MapPin
} from "lucide-react";
import { toast } from "react-toastify";

export default function ShopManagementPage() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState({});

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/shops");
            if (res.ok) {
                const data = await res.json();
                setShops(data);
            } else {
                toast.error("Failed to load shops");
            }
        } catch (error) {
            console.error("Error fetching shops:", error);
            toast.error("Could not load shops");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async (shopId, currentValue) => {
        setUpdating(prev => ({ ...prev, [shopId]: true }));

        try {
            const res = await fetch("/api/admin/shops", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shopId,
                    isVisibleToCustomers: !currentValue
                })
            });

            if (res.ok) {
                toast.success(`Shop ${!currentValue ? "shown" : "hidden"} to customers`);
                fetchShops();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [shopId]: false }));
        }
    };

    const handleToggleActive = async (shopId, currentValue) => {
        setUpdating(prev => ({ ...prev, [shopId]: true }));

        try {
            const res = await fetch("/api/admin/shops", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shopId,
                    isActive: !currentValue
                })
            });

            if (res.ok) {
                toast.success(`Shop ${!currentValue ? "activated" : "deactivated"}`);
                fetchShops();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [shopId]: false }));
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ShopCard = ({ shop }) => {
        const isUpdating = updating[shop._id];

        return (
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="flex gap-6">
                        {/* Shop Logo */}
                        <div className="flex-shrink-0">
                            {shop.logo ? (
                                <img
                                    src={shop.logo}
                                    alt={shop.name}
                                    className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                                />
                            ) : (
                                <div className="h-20 w-20 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Store className="h-10 w-10 text-orange-600" />
                                </div>
                            )}
                        </div>

                        {/* Shop Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold">{shop.name}</h3>
                                        {!shop.isActive && (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                        {!shop.isVisibleToCustomers && (
                                            <Badge variant="outline" className="bg-gray-100">
                                                <EyeOff className="h-3 w-3 mr-1" />
                                                Hidden
                                            </Badge>
                                        )}
                                        {shop.isVisibleToCustomers && shop.isActive && (
                                            <Badge className="bg-green-100 text-green-800">
                                                <Eye className="h-3 w-3 mr-1" />
                                                Visible
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Owner: {shop.owner?.name || "Unknown"} ({shop.owner?.email})
                                    </p>
                                    {shop.description && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{shop.description}</p>
                                    )}
                                    {shop.location?.city && (
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {shop.location.city}, {shop.location.state}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Products</p>
                                        <p className="text-lg font-semibold">{shop.productCount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Orders</p>
                                        <p className="text-lg font-semibold">{shop.orderCount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Revenue</p>
                                        <p className="text-lg font-semibold">${shop.totalRevenue || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-6 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={shop.isActive}
                                        onCheckedChange={() => handleToggleActive(shop._id, shop.isActive)}
                                        disabled={isUpdating}
                                    />
                                    <div>
                                        <Label className="text-sm font-medium">Shop Active</Label>
                                        <p className="text-xs text-gray-500">
                                            {shop.isActive ? "Shop is operational" : "Shop is disabled"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={shop.isVisibleToCustomers}
                                        onCheckedChange={() => handleToggleVisibility(shop._id, shop.isVisibleToCustomers)}
                                        disabled={isUpdating}
                                    />
                                    <div>
                                        <Label className="text-sm font-medium">Visible to Customers</Label>
                                        <p className="text-xs text-gray-500">
                                            {shop.isVisibleToCustomers ? "Customers can see this shop" : "Hidden from customer searches"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-full">
                    <Store className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Shop Management</h2>
                    <p className="text-gray-500">Control shop visibility and monitor performance</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-orange-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-orange-700">Total Shops</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shops.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-700">Visible Shops</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {shops.filter(s => s.isVisibleToCustomers && s.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {shops.reduce((sum, s) => sum + (s.productCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${shops.reduce((sum, s) => sum + (s.totalRevenue || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search shops by name, owner name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Shops List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
            ) : filteredShops.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        No shops found
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredShops.map(shop => (
                        <ShopCard key={shop._id} shop={shop} />
                    ))}
                </div>
            )}
        </div>
    );
}
