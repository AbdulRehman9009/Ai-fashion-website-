"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Shirt, TrendingUp, CheckCircle, Clock } from "lucide-react";
import TailorOrderCard from "@/components/tailor/TailorOrderCard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "react-toastify";

export default function TailorDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders?role=TAILOR");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        // Calculate Stats
        const active = data.filter(o => ["TailoringPending", "TailoringInProgress"].includes(o.status)).length;
        const completed = data.filter(o => o.status === "TailoringCompleted" || o.status === "DeliveryPending").length;
        // Mock earnings: $25 per order + $10 urgent
        const earnings = data.reduce((acc, o) => {
          if (o.status === "TailoringCompleted" || o.status === "DeliveryPending" || o.status === "Completed") {
            return acc + 25 + (o.urgent ? 10 : 0);
          }
          return acc;
        }, 0);

        setStats({ active, completed, earnings });
      }
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

  const activeOrders = orders.filter(o => ["TailoringPending", "TailoringInProgress"].includes(o.status) || (o.tailorAcceptanceStatus === "Pending"));
  const historyOrders = orders.filter(o => ["TailoringCompleted", "DeliveryPending", "Completed"].includes(o.status));

  // Mock Chart Data
  const chartData = [
    { name: 'Mon', earnings: 50 },
    { name: 'Tue', earnings: 75 },
    { name: 'Wed', earnings: 25 },
    { name: 'Thu', earnings: 100 },
    { name: 'Fri', earnings: stats.earnings > 250 ? stats.earnings : 120 },
    { name: 'Sat', earnings: 90 },
    { name: 'Sun', earnings: 60 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-purple-100 p-3 rounded-full">
          <Scissors className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tailoring Studio</h2>
          <p className="text-gray-500">Manage stitching assignments and track earnings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Jobs</CardTitle>
            <Shirt className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Acceptance</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.tailorAcceptanceStatus === "Pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.earnings}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? <p>Loading...</p> : activeOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
              <p>No active orders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {activeOrders.map(order => (
                <TailorOrderCard key={order._id} order={order} onUpdate={fetchOrders} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Simplified History List */}
          <div className="bg-white rounded-lg border divide-y">
            {historyOrders.map(o => (
              <div key={o._id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                    {o.items?.[0]?.product?.imageUrl ? <img src={o.items[0].product.imageUrl} className="h-full w-full object-cover rounded" /> : <Shirt className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">Order #{String(o._id).slice(-6)}</p>
                    <p className="text-sm text-gray-500">Completed on {new Date(o.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="font-bold text-green-600">+$25.00</div>
              </div>
            ))}
            {historyOrders.length === 0 && <p className="p-4 text-center text-gray-500">No completed orders yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Weekly Earnings</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#8884d8" />
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
