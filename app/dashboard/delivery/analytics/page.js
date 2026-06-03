"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Package, DollarSign, Clock, TrendingUp, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { toast } from "react-toastify";

const ACTIVE_STATUSES = ["Assigned", "OutForPickup", "PickedUp", "OutForDelivery"];

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function buildWeeklyData(deliveries) {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const delivered = deliveries.filter((delivery) => {
            if (delivery.status !== "Delivered" || !delivery.confirmedAt) return false;
            const deliveredAt = new Date(delivery.confirmedAt);
            return deliveredAt >= date && deliveredAt < nextDate;
        });

        return {
            name: date.toLocaleDateString("en-US", { weekday: "short" }),
            deliveries: delivered.length,
            earnings: delivered.reduce((sum, delivery) => sum + (delivery.fee || 10) + (delivery.urgentBonus || 0), 0),
        };
    });
}

function calculateAverageMinutes(deliveries) {
    const durations = deliveries
        .filter((delivery) => delivery.status === "Delivered" && delivery.createdAt && delivery.confirmedAt)
        .map((delivery) => Math.max(0, new Date(delivery.confirmedAt) - new Date(delivery.createdAt)));

    if (!durations.length) return 0;
    const avgMs = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    return Math.max(1, Math.round(avgMs / (1000 * 60)));
}

export default function DeliveryAnalyticsPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const [deliveriesRes, earningsRes] = await Promise.all([
                    axios.get("/api/deliveries"),
                    axios.get("/api/deliveries/earnings"),
                ]);
                setDeliveries(deliveriesRes.data || []);
                setEarnings(earningsRes.data || null);
            } catch (error) {
                console.error("Error fetching delivery analytics:", error);
                toast.error("Could not load delivery analytics");
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    const weeklyData = useMemo(() => buildWeeklyData(deliveries), [deliveries]);
    const stats = useMemo(() => {
        const today = startOfDay(new Date());
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const completed = deliveries.filter((delivery) => delivery.status === "Delivered");
        const active = deliveries.filter((delivery) => ACTIVE_STATUSES.includes(delivery.status));
        const completedToday = completed.filter((delivery) => {
            if (!delivery.confirmedAt) return false;
            const deliveredAt = new Date(delivery.confirmedAt);
            return deliveredAt >= today && deliveredAt < tomorrow;
        });

        return {
            totalDeliveries: completed.length,
            pendingDeliveries: active.length,
            completedToday: completedToday.length,
            totalEarnings: earnings?.total || completed.reduce((sum, delivery) => sum + (delivery.fee || 10) + (delivery.urgentBonus || 0), 0),
            avgDeliveryTime: calculateAverageMinutes(deliveries),
        };
    }, [deliveries, earnings]);

    const statusData = useMemo(() => ([
        { name: "Delivered", value: deliveries.filter((delivery) => delivery.status === "Delivered").length, color: "#10b981" },
        { name: "In Transit", value: deliveries.filter((delivery) => ["OutForPickup", "PickedUp", "OutForDelivery"].includes(delivery.status)).length, color: "#f59e0b" },
        { name: "Assigned", value: deliveries.filter((delivery) => delivery.status === "Assigned").length, color: "#3b82f6" },
    ]), [deliveries]);

    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Delivery Analytics</h1>
                    <p className="text-muted-foreground">Track your real delivery performance and earnings</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    <Truck className="h-4 w-4" />
                    <span>Delivery Partner Dashboard</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Deliveries" value={stats.totalDeliveries} note="Lifetime completed" icon={Package} accent="border-l-green-500 text-green-500" />
                <MetricCard title="Today's Deliveries" value={stats.completedToday} note={`${stats.pendingDeliveries} active or pending`} icon={Calendar} accent="border-l-blue-500 text-blue-500" />
                <MetricCard title="Total Earnings" value={`$${stats.totalEarnings.toLocaleString()}`} note="From completed deliveries" icon={DollarSign} accent="border-l-purple-500 text-purple-500" />
                <MetricCard title="Avg. Delivery Time" value={stats.avgDeliveryTime ? `${stats.avgDeliveryTime} min` : "N/A"} note="Created to delivered" icon={Clock} accent="border-l-orange-500 text-orange-500" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <TrendingUp className="h-5 w-5 text-gray-500" />
                            Weekly Performance
                        </CardTitle>
                        <CardDescription>Deliveries completed in the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                                    <Bar dataKey="deliveries" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <CheckCircle className="h-5 w-5 text-gray-500" />
                            Delivery Status
                        </CardTitle>
                        <CardDescription>Current status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            {statusData.map((entry) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.name}: {entry.value}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        Earnings Trend
                    </CardTitle>
                    <CardDescription>Daily delivery earnings over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => [`$${value}`, "Earnings"]} contentStyle={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                                <Line type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#16a34a" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, note, icon: Icon, accent }) {
    return (
        <Card className={`border-l-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${accent.split(" ")[0]}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${accent.split(" ")[1]}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
        </Card>
    );
}
