"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, TrendingUp, Calendar, CreditCard, CheckCircle, Package } from "lucide-react";
import { toast } from "react-toastify";
import OrderCard from "@/components/ui/OrderCard";
import { Button } from "@/components/ui/button";
import DeliveryStats from "@/components/delivery/DeliveryStats";
import DeliveryAnalytics from "@/components/delivery/DeliveryAnalytics";
import axios from "axios";

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, completed: 0, pending: 0 });

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get("/api/deliveries"); // Uses existing endpoint
      const data = res.data;
      setDeliveries(data);

      // Calculate stats
      const assigned = data.filter(d => ["OutForPickup", "OutForDelivery"].includes(d.status)).length;
      const completed = data.filter(d => d.status === "Delivered").length;
      const pending = data.filter(d => d.status === "DeliveryPending").length;

      setStats({ assigned, completed, pending });
    } catch (error) {
      console.error("Failed to fetch deliveries", error);
      toast.error("Could not load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await axios.get("/api/deliveries/earnings");
      setEarnings(res.data);
    } catch (error) {
      console.error("Failed to fetch earnings", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchEarnings();
  }, []);

  const handleAction = async (orderId, action) => {
    try {
      // action maps to: "pickup", "confirm" -> "confirm_delivery"
      const apiAction = action === "confirm" ? "confirm_delivery" : action;

      await axios.patch(`/api/orders/${orderId}/fulfillment`, { action: apiAction });
      toast.success(action === "pickup" ? "Order Picked Up" : "Delivery Confirmed");
      fetchDeliveries();
      fetchEarnings();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.error || "Action failed");
    }
  };

  const activeDeliveries = deliveries.filter(d => ["DeliveryPending", "OutForPickup", "OutForDelivery"].includes(d.status));
  const completedDeliveries = deliveries.filter(d => ["Delivered", "Completed"].includes(d.status));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="bg-green-100 p-2 sm:p-3 rounded-full w-fit">
          <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Delivery Hub</h2>
          <p className="text-sm sm:text-base text-gray-500">Manage your deliveries and track earnings</p>
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
                <OrderCard
                  key={delivery._id}
                  order={delivery}
                  actions={
                    <>
                      {delivery.status === "DeliveryPending" && (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleAction(delivery._id, "pickup")}>
                          <Package className="mr-2 h-4 w-4" /> Pickup Order
                        </Button>
                      )}
                      {(delivery.status === "OutForPickup" || delivery.status === "OutForDelivery") && (
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAction(delivery._id, "confirm")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Confirm Delivery
                        </Button>
                      )}
                    </>
                  }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedDeliveries.map((delivery) => (
                    <OrderCard key={delivery._id} order={delivery} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Today's Earnings</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">${earnings?.today || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-green-100 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">${earnings?.thisWeek || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">${earnings?.total || 0}</div>
                <p className="text-xs text-purple-600 mt-1 font-medium">
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
