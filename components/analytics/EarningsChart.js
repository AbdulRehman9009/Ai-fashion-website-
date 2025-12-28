"use client";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function EarningsChart({ data = [], colorClass = "#3b82f6" }) {
    // Format currency for tooltip
    const formatCurrency = (value) => {
        return `$${value.toFixed(2)}`;
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-white p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                        Earnings: <span className="font-semibold" style={{ color: colorClass }}>{formatCurrency(payload[0].value)}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colorClass} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={colorClass} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickLine={{ stroke: "#e5e7eb" }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={colorClass}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
