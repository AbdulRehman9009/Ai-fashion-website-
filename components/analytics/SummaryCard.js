import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function SummaryCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    className,
    colorClass = "from-blue-500 to-blue-600",
}) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = () => {
        if (!trend) return "";
        if (trend > 0) return "text-green-600";
        if (trend < 0) return "text-red-600";
        return "text-gray-600";
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md",
                className
            )}
        >
            {/* Background Gradient Accent */}
            <div className={cn("absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br opacity-10", colorClass)} />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                        {trend !== undefined && trendLabel && (
                            <div className="mt-2 flex items-center gap-1">
                                {getTrendIcon()}
                                <span className={cn("text-sm font-medium", getTrendColor())}>
                                    {Math.abs(trend)}% {trendLabel}
                                </span>
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm", colorClass)}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
