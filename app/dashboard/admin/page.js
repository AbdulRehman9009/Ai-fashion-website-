"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingBag, DollarSign, AlertCircle, Shield, Scissors, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get("/api/admin/stats"),
        axios.get("/api/admin/analytics")
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-red-100 p-3 rounded-full">
          <Shield className="h-6 w-6 text-red-900" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-gray-500">Complete system oversight and management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              {stats?.users?.byRole?.USER || 0} customers, {stats?.users?.byRole?.SHOPKEEPER || 0} shops
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-green-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.orders?.total || 0}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {stats?.orders?.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats?.revenue?.total || 0}</div>
            <p className="text-xs text-purple-600 mt-1 font-medium">
              ${stats?.revenue?.thisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-orange-100 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Actions</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.pendingActions?.total || 0}</div>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue by Day Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue by Day (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.revenueByDay || []}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.statusDistribution || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(analytics?.statusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customers:</span>
              <span className="font-semibold">{stats?.users?.byRole?.USER || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shopkeepers:</span>
              <span className="font-semibold">{stats?.users?.byRole?.SHOPKEEPER || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tailors:</span>
              <span className="font-semibold">{stats?.users?.byRole?.TAILOR || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery:</span>
              <span className="font-semibold">{stats?.users?.byRole?.DELIVERY || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-semibold text-orange-600">{stats?.orders?.pending || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">{stats?.orders?.completed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold">{stats?.orders?.total || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payments:</span>
              <span className="font-semibold text-red-600">{stats?.pendingActions?.pendingPayments || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Deliveries:</span>
              <span className="font-semibold text-blue-600">{stats?.pendingActions?.pendingDeliveries || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tailor Requests:</span>
              <span className="font-semibold text-purple-600">{stats?.pendingActions?.tailorRequests || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <a href="/dashboard/admin/users" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-blue-900">Manage Users</p>
            </a>
            <a href="/dashboard/admin/shops" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="font-semibold text-orange-900">Manage Shops</p>
            </a>
            <a href="/dashboard/admin/tailors" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold text-purple-900">Manage Tailors</p>
            </a>
            <a href="/dashboard/admin/orders" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-green-900">View Orders</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
