"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DeliveryAnalytics({ deliveries, earnings }) {
    
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });

        last7Days.push({
            name: dateStr,
            deliveries: 0,
            earnings: 0,
        });
    }

    
    deliveries.forEach((delivery) => {
        if (delivery.status === "Delivered" && delivery.confirmedAt) {
            const deliveredDate = new Date(delivery.confirmedAt);
            const daysDiff = Math.floor((today - deliveredDate) / (1000 * 60 * 60 * 24));

            if (daysDiff >= 0 && daysDiff < 7) {
                const index = 6 - daysDiff;
                last7Days[index].deliveries += 1;
                last7Days[index].earnings += (delivery.fee || 10) + (delivery.urgentBonus || 0);
            }
        }
    });

    
    const deliveredWithTiming = deliveries
        .filter((delivery) => delivery.status === "Delivered" && delivery.confirmedAt && delivery.createdAt)
        .map((delivery) => Math.max(0, new Date(delivery.confirmedAt) - new Date(delivery.createdAt)));
    const avgMs = deliveredWithTiming.length
        ? deliveredWithTiming.reduce((sum, duration) => sum + duration, 0) / deliveredWithTiming.length
        : 0;
    const avgDeliveryTime = deliveredWithTiming.length
        ? `${Math.max(1, Math.round(avgMs / (1000 * 60)))} min`
        : "N/A";
    const totalDeliveries = deliveries.filter(d => d.status === "Delivered").length;

    return (
        <div className="space-y-6">
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Delivery Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgDeliveryTime}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on {totalDeliveries} deliveries</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${earnings?.thisWeek || 0}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {last7Days.reduce((sum, day) => sum + day.deliveries, 0)} deliveries
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">${earnings?.today || 0}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {last7Days[6]?.deliveries || 0} deliveries
                        </p>
                    </CardContent>
                </Card>
            </div>

            
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Deliveries per Day</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7Days}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)", borderRadius: "8px" }}
                                />
                                <Bar dataKey="deliveries" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Earnings Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={last7Days}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)", borderRadius: "8px" }}
                                    formatter={(value) => `$${value}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: "#10b981", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
