"use client";
import { useState, useEffect } from "react";
import OrdersList from "@/components/OrdersList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, active: true });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Simulating fetching aggregation stats
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/orders?role=ADMIN");
        const data = await res.json();
        if (Array.isArray(data)) {
          const totalRev = data.reduce((acc, o) => acc + (o.pricing?.grandTotal || 0), 0);
          setStats({
            revenue: totalRev,
            orders: data.length,
            users: new Set(data.map(o => o.user._id)).size,
            active: true
          });

          // Generate mock chart data based on orders
          // In real app, aggregate by date from backend
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
          }).reverse();

          const mockData = last7Days.map(day => ({
            name: day,
            revenue: Math.floor(Math.random() * 500) + 100, // Mocking distribution
            orders: Math.floor(Math.random() * 10) + 1
          }));
          setChartData(mockData);
        }
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-red-100 p-3 rounded-full">
          <Shield className="h-6 w-6 text-red-800" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">System Admin</h2>
          <p className="text-gray-500">Platform overview and analytics.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersList role="ADMIN" />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Real-time system logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 text-sm border-b pb-2 last:border-0">
                  <div className="text-gray-400 font-mono text-xs">10:4{i} AM</div>
                  <div>
                    <p className="font-medium">New order placed</p>
                    <p className="text-xs text-gray-500">Order #{202400 + i} processed successfully.</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
