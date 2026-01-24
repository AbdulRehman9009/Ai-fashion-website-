"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Package, DollarSign, Clock, TrendingUp, Calendar, MapPin, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function DeliveryAnalyticsPage() {
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        pendingDeliveries: 0,
        completedToday: 0,
        totalEarnings: 0,
        avgDeliveryTime: 0,
        rating: 0
    });
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Simulated data - replace with actual API call
            setStats({
                totalDeliveries: 156,
                pendingDeliveries: 3,
                completedToday: 8,
                totalEarnings: 2340,
                avgDeliveryTime: 28,
                rating: 4.8
            });

            setWeeklyData([
                { name: "Mon", deliveries: 12, earnings: 180 },
                { name: "Tue", deliveries: 15, earnings: 225 },
                { name: "Wed", deliveries: 10, earnings: 150 },
                { name: "Thu", deliveries: 18, earnings: 270 },
                { name: "Fri", deliveries: 22, earnings: 330 },
                { name: "Sat", deliveries: 25, earnings: 375 },
                { name: "Sun", deliveries: 8, earnings: 120 },
            ]);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const statusData = [
        { name: "Delivered", value: 145, color: "#10b981" },
        { name: "In Transit", value: 8, color: "#f59e0b" },
        { name: "Pending", value: 3, color: "#3b82f6" },
    ];

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
                    <h1 className="text-3xl font-bold tracking-tight">Delivery Analytics</h1>
                    <p className="text-muted-foreground">Track your delivery performance and earnings</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 px-4 py-2 rounded-full text-green-700">
                    <Truck className="h-4 w-4" />
                    <span>Delivery Partner Dashboard</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                        <Package className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                        <p className="text-xs text-muted-foreground">Lifetime completed</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedToday}</div>
                        <p className="text-xs text-muted-foreground">{stats.pendingDeliveries} pending</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgDeliveryTime} min</div>
                        <p className="text-xs text-muted-foreground">Rating: ⭐ {stats.rating}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Weekly Deliveries Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-gray-500" />
                            Weekly Performance
                        </CardTitle>
                        <CardDescription>Deliveries and earnings this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                        }}
                                    />
                                    <Bar dataKey="deliveries" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-gray-500" />
                            Delivery Status
                        </CardTitle>
                        <CardDescription>Current delivery status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {statusData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-sm">{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        Earnings Trend
                    </CardTitle>
                    <CardDescription>Daily earnings over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value) => [`$${value}`, "Earnings"]}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: "#16a34a" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
