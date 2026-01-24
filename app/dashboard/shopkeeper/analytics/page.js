"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Package, DollarSign, ShoppingBag, TrendingUp, Users, Star, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

export default function ShopkeeperAnalyticsPage() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalViews: 0,
        avgRating: 0,
        ordersThisMonth: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Simulated data - replace with actual API call
            setStats({
                totalProducts: 48,
                totalOrders: 234,
                totalRevenue: 15680,
                totalViews: 4520,
                avgRating: 4.7,
                ordersThisMonth: 42
            });

            setSalesData([
                { name: "Week 1", sales: 2400, orders: 18 },
                { name: "Week 2", sales: 3200, orders: 24 },
                { name: "Week 3", sales: 2800, orders: 21 },
                { name: "Week 4", sales: 4100, orders: 32 },
            ]);

            setTopProducts([
                { name: "Premium Silk Saree", sales: 45, revenue: 2250 },
                { name: "Designer Lehenga Set", sales: 32, revenue: 4800 },
                { name: "Embroidered Kurta", sales: 28, revenue: 1680 },
                { name: "Wedding Sherwani", sales: 15, revenue: 3750 },
                { name: "Cotton Suit Set", sales: 38, revenue: 1520 },
            ]);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid gap-4 md:grid-cols-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shop Analytics</h1>
                    <p className="text-muted-foreground">Monitor your store performance and sales</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-orange-50 px-4 py-2 rounded-full text-orange-700">
                    <Store className="h-4 w-4" />
                    <span>Shopkeeper Dashboard</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">Active listings</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">{stats.ordersThisMonth} this month</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shop Rating</CardTitle>
                        <Star className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">⭐ {stats.avgRating}</div>
                        <p className="text-xs text-muted-foreground">{stats.totalViews} total views</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Sales Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-gray-500" />
                            Sales Trend
                        </CardTitle>
                        <CardDescription>Monthly sales performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value) => [`$${value}`, "Sales"]}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#f97316"
                                        fill="url(#colorSales)"
                                        strokeWidth={2}
                                    />
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                            Orders Overview
                        </CardTitle>
                        <CardDescription>Weekly order volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                        }}
                                    />
                                    <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        Top Selling Products
                    </CardTitle>
                    <CardDescription>Your best performing products this month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">${product.revenue}</p>
                                    <p className="text-xs text-muted-foreground">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
