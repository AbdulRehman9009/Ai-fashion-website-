import { cn } from "@/lib/utils";

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-4 text-center",
                className
            )}
        >
            {Icon && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description && (
                <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}
