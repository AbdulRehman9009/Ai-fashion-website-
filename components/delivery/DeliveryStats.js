"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, CheckCircle, DollarSign } from "lucide-react";

export default function DeliveryStats({ stats, earnings }) {
    const cards = [
        {
            title: "Assigned Deliveries",
            value: stats.assigned || 0,
            icon: Package,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
        {
            title: "Completed Deliveries",
            value: stats.completed || 0,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Pending Deliveries",
            value: stats.pending || 0,
            icon: TrendingUp,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Total Earnings",
            value: `$${earnings?.total || 0}`,
            icon: DollarSign,
            color: "text-green-700",
            bgColor: "bg-green-50",
            large: true,
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={index}
                        className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all h-full"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {card.title}
                            </CardTitle>
                            <div className={`${card.bgColor} p-2 rounded-lg`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {card.value}
                            </div>
                            {/* Additional info logic if needed, simplified for clean look */}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
