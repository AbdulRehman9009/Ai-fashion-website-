"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import DeliveryOrderCard from "@/components/delivery/DeliveryOrderCard";
import DeliveryStats from "@/components/delivery/DeliveryStats";
import DeliveryAnalytics from "@/components/delivery/DeliveryAnalytics";

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, completed: 0, pending: 0 });

  const fetchDeliveries = async () => {
    try {
      const res = await fetch("/api/deliveries");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);

        // Calculate stats
        const assigned = data.filter(d => d.status === "Assigned").length;
        const completed = data.filter(d => d.status === "Delivered").length;
        const pending = data.filter(d => !["Delivered", "Assigned"].includes(d.status)).length;

        setStats({ assigned, completed, pending });
      } else {
        toast.error("Failed to load deliveries");
      }
    } catch (error) {
      console.error("Failed to fetch deliveries", error);
      toast.error("Could not load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await fetch("/api/deliveries/earnings");
      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error("Failed to fetch earnings", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchEarnings();
  }, []);

  const activeDeliveries = deliveries.filter(d => d.status !== "Delivered");
  const completedDeliveries = deliveries.filter(d => d.status === "Delivered");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">
          <Truck className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Delivery Hub</h2>
          <p className="text-gray-500">Manage your deliveries and track earnings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <DeliveryStats stats={stats} earnings={earnings} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="active" className="data-[state=active]:bg-white">
            Active Deliveries
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white">
            Delivery History
          </TabsTrigger>
          <TabsTrigger value="earnings" className="data-[state=active]:bg-white">
            Earnings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Active Deliveries Tab */}
        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading deliveries...</div>
          ) : activeDeliveries.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No active deliveries</p>
                <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {activeDeliveries.map((delivery) => (
                <DeliveryOrderCard
                  key={delivery._id}
                  delivery={delivery}
                  onUpdate={() => {
                    fetchDeliveries();
                    fetchEarnings();
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {completedDeliveries.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No completed deliveries yet</p>
              ) : (
                <div className="divide-y">
                  {completedDeliveries.map((delivery) => (
                    <div key={delivery._id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                          {delivery.outfitImage ? (
                            <img
                              src={delivery.outfitImage}
                              className="h-full w-full object-cover rounded-full"
                              alt="Outfit"
                            />
                          ) : (
                            <Truck className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{delivery.customer?.name || "Customer"}</p>
                          <p className="text-sm text-gray-500">
                            Order #{String(delivery.orderId).slice(-6)} •
                            {delivery.confirmedAt
                              ? new Date(delivery.confirmedAt).toLocaleDateString()
                              : new Date(delivery.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          +${(delivery.fee || 10) + (delivery.urgentBonus || 0)}
                        </p>
                        <p className="text-xs text-gray-500">{delivery.paymentStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Today's Earnings</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">${earnings?.today || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-700">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">${earnings?.thisWeek || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Total Earnings</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">${earnings?.total || 0}</div>
                <p className="text-xs text-purple-600 mt-1">
                  {earnings?.deliveries?.completed || 0} completed deliveries
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-800">Paid</p>
                    <p className="text-sm text-green-600">Successfully transferred</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">${earnings?.paid || 0}</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-orange-800">Pending</p>
                    <p className="text-sm text-orange-600">Scheduled for next payout</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">${earnings?.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <DeliveryAnalytics deliveries={deliveries} earnings={earnings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
