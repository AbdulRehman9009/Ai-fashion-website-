import { cn } from "@/lib/utils";

export default function ProgressIndicator({
    percentage,
    size = "md",
    showLabel = true,
    variant = "circular",
    className,
}) {
    if (variant === "circular") {
        const sizes = {
            sm: { width: 60, stroke: 4 },
            md: { width: 80, stroke: 6 },
            lg: { width: 120, stroke: 8 },
        };

        const { width, stroke } = sizes[size];
        const radius = (width - stroke) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className={cn("relative inline-flex items-center justify-center", className)}>
                <svg width={width} height={width} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={stroke}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        fill="none"
                        stroke={percentage === 100 ? "#10b981" : "#3b82f6"}
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                    />
                </svg>
                {showLabel && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // Linear variant
    return (
        <div className={cn("w-full", className)}>
            <div className="overflow-hidden rounded-full bg-gray-200">
                <div
                    className={cn(
                        "h-2 rounded-full transition-all duration-500 ease-out",
                        percentage === 100 ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="mt-2 text-center text-sm font-medium text-gray-600">
                    {Math.round(percentage)}% complete
                </p>
            )}
        </div>
    );
}
