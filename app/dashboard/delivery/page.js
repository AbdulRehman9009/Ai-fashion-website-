"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, TrendingUp, Calendar, CreditCard, CheckCircle, Package, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import OrderCard from "@/components/ui/OrderCard";
import { Button } from "@/components/ui/button";
import DeliveryAnalytics from "@/components/delivery/DeliveryAnalytics";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, completed: 0, pending: 0 });

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get("/api/deliveries");
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Delivery Hub</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your deliveries and track earnings.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 border-gray-200 dark:border-gray-800">
            Route Map
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
          title="Active Deliveries"
          value={stats.assigned}
          icon={Truck}
          trend="On Route"
          trendUp={true}
          description="currently assigned"
          color="blue"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          trend="+12 this week"
          trendUp={true}
          description="successfully delivered"
          color="green"
        />
        <StatsCard
          title="Pending Pickup"
          value={stats.pending}
          icon={Package}
          trend={stats.pending > 0 ? "Pickups available" : "No pickups"}
          trendUp={stats.pending > 0}
          description="waiting at store"
          color="orange"
        />
        <StatsCard
          title="Today's Earnings"
          value={`$${earnings?.today || 0}`}
          icon={CreditCard}
          trend="Daily"
          trendUp={true}
          description="earned today"
          color="purple"
        />
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 rounded-xl w-full sm:w-auto inline-flex h-12">
          <TabsTrigger value="active" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
            Active Deliveries
            {activeDeliveries.length > 0 && <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border-0">{activeDeliveries.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
            History
          </TabsTrigger>
          <TabsTrigger value="earnings" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
            Earnings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
            Analytics
          </TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Active Deliveries Tab */}
          <TabsContent value="active" className="space-y-4 mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : activeDeliveries.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="font-medium text-gray-900 dark:text-white">No active deliveries</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDeliveries.map((delivery) => (
                  <OrderCard
                    key={delivery._id}
                    order={delivery}
                    actions={
                      <>
                        {delivery.status === "DeliveryPending" && (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => handleAction(delivery._id, "pickup")}>
                            <Package className="mr-2 h-4 w-4" /> Pickup Order
                          </Button>
                        )}
                        {(delivery.status === "OutForPickup" || delivery.status === "OutForDelivery") && (
                          <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md" onClick={() => handleAction(delivery._id, "confirm")}>
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
          <TabsContent value="history" className="space-y-4 mt-0">
            {completedDeliveries.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="font-medium text-gray-900 dark:text-white">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedDeliveries.map((delivery) => (
                  <OrderCard key={delivery._id} order={delivery} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4 mt-0">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Earnings</CardTitle>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">${earnings?.today || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border border-green-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</CardTitle>
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">${earnings?.thisWeek || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border border-purple-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</CardTitle>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">${earnings?.total || 0}</div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                    {earnings?.deliveries?.completed || 0} completed deliveries
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Breakdown */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">Paid</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Successfully transferred</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">${earnings?.paid || 0}</p>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                    <div>
                      <p className="font-semibold text-orange-800 dark:text-orange-300">Pending</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">Scheduled for next payout</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">${earnings?.pending || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-0">
            <DeliveryAnalytics deliveries={deliveries} earnings={earnings} />
          </TabsContent>
        </motion.div>
      </Tabs>
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
