"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import SummaryCard from "@/components/analytics/SummaryCard";
import OrdersChart from "@/components/analytics/OrdersChart";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Scissors, Clock, CheckCircle2, TrendingUp, Award } from "lucide-react";

export default function TailorAnalyticsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [popularSpecializations, setPopularSpecializations] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get("/api/dashboard/tailor/stats");
            setStats(res.data.stats);
            setChartData(res.data.chartData);
            setPopularSpecializations(res.data.popularSpecializations);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSkeleton type="card" />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-2 text-gray-600">Track your performance and growth</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={Scissors}
                    trend={0}
                    trendLabel="lifetime orders"
                    colorClass="from-purple-500 to-purple-600"
                />
                <SummaryCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle2}
                    trend={0}
                    trendLabel="fulfilled jobs"
                    colorClass="from-green-500 to-green-600"
                />
                <SummaryCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    colorClass="from-blue-500 to-blue-600"
                />
                <SummaryCard
                    title="Avg Rating"
                    value={stats.avgRating.toFixed(1)}
                    icon={Award}
                    trend={0}
                    trendLabel="rating"
                    colorClass="from-yellow-500 to-yellow-600"
                />
            </div>

            {/* Completion Rate */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Completion Rate</h2>
                <div className="flex items-center gap-4">
                    <div className="relative h-32 w-32">
                        <svg className="h-full w-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="12"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="#9333ea"
                                strokeWidth="12"
                                strokeDasharray={`${(stats.completionRate / 100) * 352} 352`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{stats.completionRate}%</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">
                            You have successfully completed {stats.completionRate}% of all assigned orders. Keep up the excellent work!
                        </p>
                    </div>
                </div>
            </div>

            {/* Orders Chart */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Orders Over Time</h2>
                <OrdersChart data={chartData} />
            </div>

            {/* Specialization Performance */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Popular Specializations</h2>
                <div className="space-y-4">
                    {popularSpecializations.map((spec) => (
                        <div key={spec.name}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{spec.name}</span>
                                <span className="text-sm text-gray-600">{spec.count} orders</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                                    style={{ width: `${spec.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
