"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Shirt, TrendingUp, CheckCircle, Clock, Truck, Loader2 } from "lucide-react";
import OrderCard from "@/components/ui/OrderCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "react-toastify";
import axios from "axios";
import AssignDeliveryDialog from "@/components/tailor/AssignDeliveryDialog";

export default function TailorDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0, pendingDelivery: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deliveryDialogOrder, setDeliveryDialogOrder] = useState(null);

  const fetchOrders = async () => {
    try {
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
      const completed = data.filter(o => ["TailoringCompleted", "DeliveryPending", "Completed", "stitched"].includes(o.status)).length;
      const pendingDelivery = data.filter(o => o.status === "TailoringCompleted").length;

      // Calculate earnings based on completed jobs
      const earnings = data.reduce((acc, o) => {
        if (["TailoringCompleted", "DeliveryPending", "Completed", "Delivered"].includes(o.status)) {
          return acc + 25 + (o.urgent ? 10 : 0);
        }
        return acc;
      }, 0);

      setStats({ active, completed, earnings, pendingDelivery });
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
    setActionLoading(orderId);
    try {
      let payload = {};
      let endpoint = `/api/orders/${orderId}/tailor`;

      if (action === "accept") {
        payload = { action: "accept" };
      } else if (action === "mark_stitched") {
        endpoint = `/api/orders/${orderId}/status`;
        payload = { status: "TailoringCompleted" };
      }

      await axios.patch(endpoint, payload);

      toast.success(action === "accept" ? "Job accepted successfully!" : "Order marked as stitched!");
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliveryAssigned = () => {
    fetchOrders();
  };

  const activeOrders = orders.filter(o => ["TailoringPending", "TailoringInProgress", "placed"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "TailoringCompleted");
  const historyOrders = orders.filter(o => ["DeliveryPending", "Completed", "Delivered", "stitched"].includes(o.status));

  // Chart data
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
        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-full w-fit">
          <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Tailoring Studio</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Manage stitching assignments and track earnings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border border-purple-100 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <Shirt className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border border-orange-100 dark:border-orange-900/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Ready for Delivery</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <Truck className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingDelivery}</div>
          </CardContent>
        </Card>
        <Card className="border border-green-100 dark:border-green-900/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${stats.earnings}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Active Jobs
            {stats.active > 0 && (
              <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">{stats.active}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivery" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Assign Delivery
            {stats.pendingDelivery > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400">{stats.pendingDelivery}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">History</TabsTrigger>
          <TabsTrigger value="earnings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Earnings</TabsTrigger>
        </TabsList>

        {/* Active Jobs Tab */}
        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <Shirt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">No active stitching jobs.</p>
              <p className="text-sm mt-1">New jobs will appear here when assigned by shopkeepers.</p>
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
                        <Button
                          size="sm"
                          onClick={() => handleAction(order._id, "accept")}
                          disabled={actionLoading === order._id}
                          className="bg-purple-600 hover:bg-purple-700 w-full"
                        >
                          {actionLoading === order._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Accept Job
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAction(order._id, "mark_stitched")}
                          disabled={actionLoading === order._id}
                          className="bg-green-600 hover:bg-green-700 w-full"
                        >
                          {actionLoading === order._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Mark Stitched
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assign Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">No orders ready for delivery assignment.</p>
              <p className="text-sm mt-1">Completed stitching jobs will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedOrders.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  actions={
                    <Button
                      size="sm"
                      onClick={() => setDeliveryDialogOrder(order)}
                      className="bg-blue-600 hover:bg-blue-700 w-full gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      Assign Delivery
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {historyOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No completed orders yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyOrders.map(o => (
                <OrderCard key={o._id} order={o} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dark:border-gray-700">
              <CardHeader><CardTitle className="text-gray-900 dark:text-white">Weekly Earnings</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="dark:border-gray-700">
              <CardHeader><CardTitle className="text-gray-900 dark:text-white">Earnings Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Base Rate per Job</span>
                  <span className="font-bold text-gray-900 dark:text-white">$25</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Urgent Job Bonus</span>
                  <span className="font-bold text-orange-600">+$10</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
                  <span className="font-bold text-green-600 text-xl">${stats.earnings}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Delivery Dialog */}
      <AssignDeliveryDialog
        open={!!deliveryDialogOrder}
        onOpenChange={(open) => !open && setDeliveryDialogOrder(null)}
        order={deliveryDialogOrder}
        onSuccess={handleDeliveryAssigned}
      />
    </div>
  );
}
