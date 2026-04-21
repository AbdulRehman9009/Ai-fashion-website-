"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

export default function CustomerAnalyticsPage() {
    const { data: session } = useSession();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/user/analytics");
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">
                    Your shopping insights and statistics
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Orders
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Spent
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${analytics?.totalSpent?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime spending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Order
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${analytics?.averageOrder?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per order
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Orders
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.activeOrders || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            In progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics?.recentOrders?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.recentOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">Order #{order._id.slice(-6)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${order.pricing?.grandTotal?.toFixed(2) || "0.00"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No orders yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Favorite Shops */}
            <Card>
                <CardHeader>
                    <CardTitle>Favorite Shops</CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics?.favoriteShops?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.favoriteShops.map((shop) => (
                                <div
                                    key={shop._id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium">{shop.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {shop.orderCount} orders
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${shop.totalSpent?.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No shop data yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
