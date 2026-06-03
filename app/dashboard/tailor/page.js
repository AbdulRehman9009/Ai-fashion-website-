"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Shirt, TrendingUp, CheckCircle, Clock, Truck, Loader2, ArrowUpRight } from "lucide-react";
import OrderCard from "@/components/ui/OrderCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "react-toastify";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import AssignDeliveryDialog from "@/components/tailor/AssignDeliveryDialog";
import { motion } from "framer-motion";

export default function TailorDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0, pendingDelivery: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deliveryDialogOrder, setDeliveryDialogOrder] = useState(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

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

  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    return !searchQuery ||
        String(o._id).toLowerCase().includes(query) ||
        o.user?.name?.toLowerCase().includes(query) ||
        o.user?.email?.toLowerCase().includes(query) ||
        o.status?.toLowerCase().includes(query) ||
        o.items?.some(item => item.product?.title?.toLowerCase().includes(query));
  });

  const activeOrders = filteredOrders.filter(o => ["TailoringPending", "TailoringInProgress", "placed"].includes(o.status));
  const completedOrders = filteredOrders.filter(o => o.status === "TailoringCompleted");
  const historyOrders = filteredOrders.filter(o => ["DeliveryPending", "Completed", "Delivered", "stitched"].includes(o.status));

  // Calculate actual daily earnings for the chart from orders completed in the last 7 days
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyEarnings = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  
  orders.forEach(o => {
    if (["TailoringCompleted", "DeliveryPending", "Completed", "Delivered", "stitched"].includes(o.status)) {
      const date = new Date(o.updatedAt || o.createdAt);
      const dayName = daysOfWeek[date.getDay()];
      const amt = 25 + (o.urgent ? 10 : 0);
      dailyEarnings[dayName] += amt;
    }
  });

  const chartData = [
    { name: 'Mon', earnings: dailyEarnings['Mon'] },
    { name: 'Tue', earnings: dailyEarnings['Tue'] },
    { name: 'Wed', earnings: dailyEarnings['Wed'] },
    { name: 'Thu', earnings: dailyEarnings['Thu'] },
    { name: 'Fri', earnings: dailyEarnings['Fri'] },
    { name: 'Sat', earnings: dailyEarnings['Sat'] },
    { name: 'Sun', earnings: dailyEarnings['Sun'] },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Tailoring Studio</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage stitching assignments and track your earnings.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 border-gray-200 dark:border-gray-800">
            Work Schedule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Active Jobs"
          value={stats.active}
          icon={Shirt}
          trend="In Progress"
          trendUp={true}
          description="orders being stitched"
          color="purple"
        />
        <StatsCard
          title="Ready for Delivery"
          value={stats.pendingDelivery}
          icon={Truck}
          trend={stats.pendingDelivery > 0 ? "Action needed" : "All clear"}
          trendUp={stats.pendingDelivery === 0}
          description="waiting for assignment"
          color="orange"
        />
        <StatsCard
          title="Completed Jobs"
          value={stats.completed}
          icon={CheckCircle}
          trend="+8 this week"
          trendUp={true}
          description="successfully stitched"
          color="green"
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats.earnings}`}
          icon={TrendingUp}
          trend="+15%"
          trendUp={true}
          description="total revenue generated"
          color="blue"
        />
      </motion.div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 rounded-xl w-full sm:w-auto inline-flex h-12">
          <TabsTrigger value="active" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
            Active Jobs
            {stats.active > 0 && <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 border-0">{stats.active}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="delivery" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
            Assign Delivery
            {stats.pendingDelivery > 0 && <Badge className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 border-0">{stats.pendingDelivery}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">History</TabsTrigger>
          <TabsTrigger value="earnings" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">Earnings</TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Active Jobs Tab */}
          <TabsContent value="active" className="space-y-4 mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Shirt className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="font-medium text-gray-900 dark:text-white">No active stitching jobs.</p>
                <p className="text-sm text-gray-500 mt-1">New jobs will appear here when assigned by shopkeepers.</p>
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
                            className="bg-purple-600 hover:bg-purple-700 w-full shadow-md"
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
                            className="bg-green-600 hover:bg-green-700 w-full shadow-md"
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
          <TabsContent value="delivery" className="space-y-4 mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="font-medium text-gray-900 dark:text-white">No orders ready for delivery assignment.</p>
                <p className="text-sm text-gray-500 mt-1">Completed stitching jobs will appear here.</p>
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
                        className="bg-blue-600 hover:bg-blue-700 w-full gap-2 shadow-md"
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
          <TabsContent value="history" className="space-y-4 mt-0">
            {historyOrders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="font-medium text-gray-900 dark:text-white">No completed orders yet.</p>
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
          <TabsContent value="earnings" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-gray-200 dark:border-gray-800 shadow-md">
                <CardHeader><CardTitle className="text-gray-900 dark:text-white">Weekly Earnings</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        cursor={{ fill: 'var(--muted)' }}
                      />
                      <Bar dataKey="earnings" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-800 shadow-md">
                <CardHeader><CardTitle className="text-gray-900 dark:text-white">Earnings Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-400">Base Rate per Job</span>
                    <span className="font-bold text-gray-900 dark:text-white">$25</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-400">Urgent Job Bonus</span>
                    <span className="font-bold text-orange-600">+$10</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total Earnings</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-xl">${stats.earnings}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </motion.div>
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

function StatsCard({ title, value, icon: Icon, trend, trendUp, description, color }) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-teal-500",
    orange: "from-orange-500 to-amber-500",
    purple: "from-purple-500 to-pink-500",
  };

  const lightColors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom, var(--${color}-500), transparent)` }} />

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${lightColors[color]} dark:bg-opacity-10 dark:text-white ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
              <Icon className="h-5 w-5" />
            </div>
            {trend && (
              <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                {trend}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center text-xs text-gray-400">
            <span>{description}</span>
            <ArrowUpRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
