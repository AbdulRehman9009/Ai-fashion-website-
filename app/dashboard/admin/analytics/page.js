"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Store, Scissors, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30");

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?days=${timeRange}`);
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            } else {
                toast.error("Failed to load analytics");
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Could not load analytics");
        } finally {
            setLoading(false);
        }
    };

    const COLORS = {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        purple: "#a855f7",
        orange: "#f97316"
    };

    const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.orange];

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                        <p className="text-gray-500">Platform performance insights and trends</p>
                    </div>
                </div>

                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 Days</SelectItem>
                        <SelectItem value="14">Last 14 Days</SelectItem>
                        <SelectItem value="30">Last 30 Days</SelectItem>
                        <SelectItem value="60">Last 60 Days</SelectItem>
                        <SelectItem value="90">Last 90 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <CardTitle>Revenue Trend</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.revenueByDay || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value) => [`$${value}`, 'Revenue']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke={COLORS.success}
                                strokeWidth={2}
                                dot={{ fill: COLORS.success, r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Orders Per Day Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                        <CardTitle>Orders Per Day</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.ordersByDay || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value) => [`${value} orders`, 'Orders']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            <Bar
                                dataKey="orders"
                                fill={COLORS.primary}
                                radius={[8, 8, 0, 0]}
                                name="Orders"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Shops and Tailors */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Shops */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-orange-600" />
                            <CardTitle>Top Shops by Revenue</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {analytics?.topShops && analytics.topShops.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.topShops.map((shop, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx === 0 ? 'bg-yellow-500' :
                                                    idx === 1 ? 'bg-gray-400' :
                                                        idx === 2 ? 'bg-orange-600' :
                                                            'bg-gray-300'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{shop.name}</p>
                                                <p className="text-sm text-gray-500">${shop.revenue} revenue</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">${shop.revenue}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Tailors */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Scissors className="h-5 w-5 text-purple-600" />
                            <CardTitle>Top Tailors by Orders</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {analytics?.topTailors && analytics.topTailors.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.topTailors.map((tailor, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx === 0 ? 'bg-yellow-500' :
                                                    idx === 1 ? 'bg-gray-400' :
                                                        idx === 2 ? 'bg-orange-600' :
                                                            'bg-gray-300'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{tailor.name}</p>
                                                <p className="text-sm text-gray-500">{tailor.orders} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{tailor.orders}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Order Status Distribution */}
            {analytics?.statusDistribution && analytics.statusDistribution.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ status, count }) => `${status}: ${count}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {analytics.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [`${value} orders`, props.payload.status]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Average Order Value</p>
                                <p className="text-2xl font-bold">
                                    ${analytics?.revenueByDay && analytics.ordersByDay
                                        ? Math.round(
                                            analytics.revenueByDay.reduce((sum, d) => sum + d.revenue, 0) /
                                            Math.max(analytics.ordersByDay.reduce((sum, d) => sum + d.orders, 0), 1)
                                        )
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue (Period)</p>
                                <p className="text-2xl font-bold">
                                    ${analytics?.revenueByDay?.reduce((sum, d) => sum + d.revenue, 0) || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Orders (Period)</p>
                                <p className="text-2xl font-bold">
                                    {analytics?.ordersByDay?.reduce((sum, d) => sum + d.orders, 0) || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
