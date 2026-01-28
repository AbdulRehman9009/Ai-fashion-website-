"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Shirt, TrendingUp, CheckCircle, Clock } from "lucide-react";
import OrderCard from "@/components/ui/OrderCard"; // New generic card
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "react-toastify";
import axios from "axios"; // Switch to axios

export default function TailorDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // Using axios as requested
      const res = await axios.get("/api/orders?role=TAILOR");
      const data = res.data;

      // Sort: Urgent first, then by date
      const sortedData = data.sort((a, b) => {
        if (a.urgent === b.urgent) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.urgent ? -1 : 1;
      });

      setOrders(sortedData);

      // Calculate Stats
      const active = data.filter(o => ["TailoringPending", "TailoringInProgress", "placed"].includes(o.status)).length;
      const completed = data.filter(o => ["TailoringCompleted", "DeliveryPending", "stitched"].includes(o.status)).length;

      // Mock earnings
      const earnings = data.reduce((acc, o) => {
        if (["TailoringCompleted", "DeliveryPending", "Completed"].includes(o.status)) {
          return acc + 25 + (o.urgent ? 10 : 0);
        }
        return acc;
      }, 0);

      setStats({ active, completed, earnings });
    } catch (e) {
      console.error("Failed to fetch tailor orders", e);
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId, action) => {
    try {
      // Using axios for status updates
      // Mapping user friendly actions to system logic
      // "Accept Job" -> assigns tailor (usually done via separate API, but using generic status update for now or dedicated endpoint)
      // "Mark Stitched" -> status: TailoringCompleted (or 'stitched' if user insists on exact status name)

      let payload = {};
      let endpoint = `/api/orders/${orderId}/tailor`; // Use existing tailor route if fitting, or generic

      if (action === "accept") {
        payload = { action: "accept" }; // Logic handled in API
      } else if (action === "mark_stitched") {
        endpoint = `/api/orders/${orderId}/status`;
        payload = { status: "TailoringCompleted" }; // System equivalent of stitched
      }

      await axios.patch(endpoint, payload);

      toast.success(action === "accept" ? "Order Accepted" : "Status Updated");
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error("Action failed");
    }
  };

  const activeOrders = orders.filter(o => ["TailoringPending", "TailoringInProgress", "placed"].includes(o.status));
  const historyOrders = orders.filter(o => ["TailoringCompleted", "DeliveryPending", "Completed", "stitched"].includes(o.status));

  // Mock Chart Data
  const chartData = [
    { name: 'Mon', earnings: 50 },
    { name: 'Tue', earnings: 75 },
    { name: 'Wed', earnings: 25 },
    { name: 'Thu', earnings: 100 },
    { name: 'Fri', earnings: stats.earnings > 250 ? stats.earnings : 120 },
    { name: 'Sun', earnings: 60 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="bg-purple-100 p-2 sm:p-3 rounded-full w-fit">
          <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tailoring Studio</h2>
          <p className="text-sm sm:text-base text-gray-500">Manage stitching assignments and track earnings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        <Card className="border border-purple-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Jobs</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shirt className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border border-green-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats.earnings}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? <p>Loading...</p> : activeOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
              <p>No active stitching jobs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  actions={
                    <>
                      {order.tailorAcceptanceStatus === "Pending" ? (
                        <Button size="sm" onClick={() => handleAction(order._id, "accept")} className="bg-purple-600 hover:bg-purple-700 w-full">
                          Accept Job
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleAction(order._id, "mark_stitched")} className="bg-green-600 hover:bg-green-700 w-full">
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Stitched
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Reusing OrderCard for history as well, but no actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyOrders.map(o => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Weekly Output</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
