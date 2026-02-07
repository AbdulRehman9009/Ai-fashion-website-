"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Package, ShoppingBag, DollarSign, Plus, AlertTriangle, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductList from "@/components/shop/ProductList";
import OrderListShop from "@/components/shop/OrderListShop";
import ShopAnalytics from "@/components/shop/ShopAnalytics";
import axios from "axios";

export default function ShopkeeperDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalProducts: 0, activeOrders: 0, lowStockProducts: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();

    const run = async () => {
      if (!mounted) return;
      await fetchStats(ac.signal);
    };

    run();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, []);

  const fetchStats = async (signal) => {
    try {
      const res = await axios.get("/api/dashboard/shopkeeper/stats", { signal });
      setStats(res.data);
    } catch (e) {
      if (axios.isCancel(e)) return;
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Store Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's what's happening in your store today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/shopkeeper/settings">
            <Button variant="outline" className="h-10 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800">
              Settings
            </Button>
          </Link>
          <Link href="/dashboard/shopkeeper/products/new">
            <Button className="h-10 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
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
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          trend="+12%" // Placeholder trend
          trendUp={true}
          description="items in inventory"
          color="blue"
          delay={0}
        />
        <StatsCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={ShoppingBag}
          trend="+5"
          trendUp={true}
          description="orders to fulfill"
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+24%"
          trendUp={true}
          description="this month"
          color="orange"
          delay={0.2}
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          trend={stats.lowStockProducts > 0 ? "Action needed" : "Healthy"}
          trendUp={stats.lowStockProducts === 0}
          description="items need restock"
          color="red"
          delay={0.3}
        />
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 rounded-xl w-full sm:w-auto inline-flex h-12">
          <TabsTrigger value="products" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">Products</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">Orders</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg px-6 h-10 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all">Analytics</TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TabsContent value="products" className="space-y-4 mt-0">
            <ProductList />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 mt-0">
            <OrderListShop />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-0">
            <ShopAnalytics />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, description, color, delay }) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-teal-500",
    orange: "from-orange-500 to-amber-500",
    red: "from-red-500 to-pink-500",
  };

  const lightColors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
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
