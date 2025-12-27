"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RecommendationForm from "@/components/RecommendationForm";
import OrdersList from "@/components/OrdersList";
import ShopSection from "@/components/shop/ShopSection";
import CheckoutDialog from "@/components/shop/CheckoutDialog";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle, Clock, Upload, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshOrders, setRefreshOrders] = useState(0);
  const [stats, setStats] = useState({ activeOrders: 0, completedOrders: 0, pendingPayments: 0 });

  useEffect(() => {
    fetchStats();
  }, [refreshOrders]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/user/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleOrderSuccess = () => {
    setRefreshOrders(prev => prev + 1);
    fetchStats();
    setActiveTab("overview");
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl"
      >
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">
            {getTimeBasedGreeting()}, {session?.user?.name || "Style Icon"}!
          </h2>
          <p className="text-blue-100 text-lg opacity-90 max-w-xl">
            Ready to upgrade your wardrobe? Explore our AI recommendations or track your custom orders.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-3">
          <Button variant="secondary" onClick={() => setActiveTab("overview")} className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
            <Upload className="mr-2 h-4 w-4" /> New AI Look
          </Button>
          <Button variant="secondary" onClick={() => setActiveTab("shop")} className="bg-white text-blue-700 hover:bg-blue-50">
            Browse Shop
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">In progress & shipping</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Lifetime delivered</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Action required</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 w-fit shadow-inner">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === "overview" ? "bg-white shadow-sm text-gray-900 scale-105" : "text-gray-500 hover:text-gray-900"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === "shop" ? "bg-white shadow-sm text-gray-900 scale-105" : "text-gray-500 hover:text-gray-900"}`}
            >
              Browse Shop
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid gap-8 lg:grid-cols-7"
          >
            <div className="lg:col-span-4 space-y-6">
              <RecommendationForm onProductSelect={handleAddToCart} />
            </div>
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-5 w-5" /> Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <OrdersList role="USER" key={refreshOrders} limit={5} compact={true} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "shop" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ShopSection onAddToCart={handleAddToCart} />
          </motion.div>
        )}
      </div>

      <CheckoutDialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        product={selectedProduct}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}
