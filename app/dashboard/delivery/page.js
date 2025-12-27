"use client";
import OrdersList from "@/components/OrdersList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function DeliveryDashboard() {
  const [stats, setStats] = useState({ pending: 0, completed: 0, earnings: 0 });

  useEffect(() => {
    // Mock stats
    setStats({
      pending: 3,
      completed: 45,
      earnings: 45 * 10 // $10 per delivery
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">
          <Truck className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Delivery Hub</h2>
          <p className="text-gray-500">Route management and earnings overview.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 bg-gray-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.earnings}</div>
            <p className="text-sm text-gray-400">Payout scheduled for Friday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Current Routes</h3>
          <OrdersList role="DELIVERY" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Map View</h3>
          <Card className="h-[400px] bg-gray-100 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Map Integration Placeholder</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
