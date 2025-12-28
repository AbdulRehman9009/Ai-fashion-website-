import { cn } from "@/lib/utils";

export function CardSkeleton({ className }) {
    return (
        <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
            <div className="animate-pulse space-y-4">
                <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200"></div>
                <div className="h-3 w-full rounded bg-gray-100"></div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4, className }) {
    return (
        <div className={cn("overflow-hidden rounded-lg border bg-white", className)}>
            <div className="animate-pulse">
                {/* Header */}
                <div className="flex gap-4 border-b bg-gray-50 p-4">
                    {Array.from({ length: cols }).map((_, i) => (
                        <div key={i} className="h-4 flex-1 rounded bg-gray-200"></div>
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4 border-b p-4">
                        {Array.from({ length: cols }).map((_, colIndex) => (
                            <div key={colIndex} className="h-4 flex-1 rounded bg-gray-100"></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton({ items = 5, className }) {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                                <div className="h-3 w-1/2 rounded bg-gray-100"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function LoadingSkeleton({ type = "card", ...props }) {
    switch (type) {
        case "card":
            return <CardSkeleton {...props} />;
        case "table":
            return <TableSkeleton {...props} />;
        case "list":
            return <ListSkeleton {...props} />;
        default:
            return <CardSkeleton {...props} />;
    }
}
