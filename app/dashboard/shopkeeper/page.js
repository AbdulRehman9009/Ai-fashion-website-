"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Package, ShoppingBag, DollarSign, Plus, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductList from "@/components/shop/ProductList";
import OrderListShop from "@/components/shop/OrderListShop";
import ShopAnalytics from "@/components/shop/ShopAnalytics";

export default function ShopkeeperDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalProducts: 0, activeOrders: 0, lowStockProducts: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/shopkeeper/stats");
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-orange-600 to-red-600 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h2 className="text-3xl font-bold">Store Dashboard</h2>
          <p className="text-orange-100 opacity-90">Manage your products, track orders, and view revenue.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex gap-2">
            <Link href="/dashboard/shopkeeper/settings">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Settings
              </Button>
            </Link>
            <Link href="/dashboard/shopkeeper/products/new">
              <Button variant="secondary" className="bg-white text-orange-700 hover:bg-orange-50 font-semibold shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductList />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrderListShop />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ShopAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
