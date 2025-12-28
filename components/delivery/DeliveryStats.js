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
                        className={card.large ? "md:col-span-2 bg-gradient-to-br from-green-600 to-green-700 text-white" : ""}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className={`text-sm font-medium ${card.large ? "text-green-100" : "text-gray-600"}`}>
                                {card.title}
                            </CardTitle>
                            <div className={`${card.large ? "bg-white/20" : card.bgColor} p-2 rounded-full`}>
                                <Icon className={`h-4 w-4 ${card.large ? "text-white" : card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${card.large ? "" : "text-gray-900"}`}>
                                {card.value}
                            </div>
                            {card.large && earnings && (
                                <p className="text-sm text-green-100 mt-1">
                                    {earnings.pending > 0 ? `$${earnings.pending} pending` : "All paid"}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
