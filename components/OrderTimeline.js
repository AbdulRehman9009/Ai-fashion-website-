import { CheckCircle, Circle, ArrowDown } from "lucide-react";

export default function OrderTimeline({ timeline = [], status }) {
    const steps = [
        { id: "PENDING", label: "Order Placed" },
        { id: "ACCEPTED", label: "Accepted by Shop" },
        { id: "STITCHING", label: "Tailoring in Progress" },
        { id: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
        { id: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
        { id: "DELIVERED", label: "Delivered" },
    ];

    const isCompleted = (stepId) => {
        const currentIndex = steps.findIndex(s => s.id === status);
        const stepIndex = steps.findIndex(s => s.id === stepId);

        // Timeline event check (if provided)
        const hasEvent = timeline.some(t => t.status === stepId);

        return hasEvent || (currentIndex >= 0 && stepIndex <= currentIndex);
    };

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-8 relative">
                {steps.map((step, index) => {
                    const completed = isCompleted(step.id);
                    const current = status === step.id; // Or last event

                    return (
                        <div key={step.id} className="flex items-start gap-4">
                            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900 transition-colors ${completed ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30" : "border-gray-300 dark:border-gray-600"}`}>
                                {completed ? (
                                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                )}
                            </div>
                            <div className="pt-1">
                                <p className={`font-semibold ${completed ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
