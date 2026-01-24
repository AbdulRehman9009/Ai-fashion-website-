"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    TrendingUp,
    Users,
    Wallet,
    CheckCircle,
    Loader2,
    Store,
    Scissors,
    Truck,
    AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function FinanceDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayouts, setSelectedPayouts] = useState([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/payouts?status=pending");
            setData(res.data);
        } catch (error) {
            console.error("Error fetching finance data:", error);
            toast.error("Failed to load finance data");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPayout = (payoutId) => {
        setSelectedPayouts(prev =>
            prev.includes(payoutId)
                ? prev.filter(id => id !== payoutId)
                : [...prev, payoutId]
        );
    };

    const handleSelectAll = () => {
        if (!data?.payouts) return;

        if (selectedPayouts.length === data.payouts.length) {
            setSelectedPayouts([]);
        } else {
            setSelectedPayouts(data.payouts.map(p => p._id));
        }
    };

    const handleMarkAsPaid = async () => {
        if (selectedPayouts.length === 0) {
            toast.warning("Please select at least one payout");
            return;
        }

        setProcessing(true);
        try {
            await axios.patch("/api/admin/payouts", {
                payoutIds: selectedPayouts,
                notes: `Marked as paid on ${new Date().toLocaleDateString()}`
            });
            toast.success(`${selectedPayouts.length} payout(s) marked as paid!`);
            setSelectedPayouts([]);
            fetchData();
        } catch (error) {
            toast.error("Failed to update payouts");
        } finally {
            setProcessing(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "SHOPKEEPER": return <Store className="h-4 w-4" />;
            case "TAILOR": return <Scissors className="h-4 w-4" />;
            case "DELIVERY": return <Truck className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "SHOPKEEPER": return "bg-orange-100 text-orange-800";
            case "TAILOR": return "bg-purple-100 text-purple-800";
            case "DELIVERY": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12 min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                        <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Finance Dashboard</h2>
                        <p className="text-sm sm:text-base text-gray-500">Manage revenue and provider payouts</p>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">${data?.totalRevenue?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-green-600 mt-1">From completed payments</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700">Pending Payouts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">${data?.summary?.totalPending?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-orange-600 mt-1">Owed to providers</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">
                            ${((data?.totalRevenue || 0) - (data?.summary?.totalPending || 0)).toFixed(2)}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Revenue minus payouts</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">Payout Requests</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">{data?.pagination?.total || 0}</div>
                        <p className="text-xs text-purple-600 mt-1">Pending payments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payout Breakdown by Role */}
            {data?.summary?.byRole && Object.keys(data.summary.byRole).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pending Payouts by Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                            {Object.entries(data.summary.byRole).map(([role, info]) => (
                                <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        {getRoleIcon(role)}
                                        <span className="font-medium">{role}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">${info.amount?.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{info.count} payouts</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pending Payouts Table */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Pending Payouts</CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                        >
                            {selectedPayouts.length === data?.payouts?.length ? "Deselect All" : "Select All"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleMarkAsPaid}
                            disabled={selectedPayouts.length === 0 || processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Mark as Paid ({selectedPayouts.length})
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!data?.payouts || data.payouts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                            <p className="text-lg font-medium">All caught up!</p>
                            <p className="text-sm">No pending payouts at the moment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 font-medium text-gray-500 text-sm">Select</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500 text-sm">Provider</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500 text-sm">Type</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500 text-sm">Order</th>
                                        <th className="text-right py-3 px-2 font-medium text-gray-500 text-sm">Amount</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-500 text-sm">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.payouts.map((payout) => (
                                        <tr key={payout._id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPayouts.includes(payout._id)}
                                                    onChange={() => handleSelectPayout(payout._id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getRoleColor(payout.providerRole)}>
                                                        {getRoleIcon(payout.providerRole)}
                                                    </Badge>
                                                    <div>
                                                        <div className="font-medium">{payout.userId?.name || "Unknown"}</div>
                                                        <div className="text-xs text-gray-500">{payout.userId?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge variant="outline">{payout.type?.replace("_", " ")}</Badge>
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-600">
                                                #{payout.orderId?._id?.toString().slice(-6) || "N/A"}
                                            </td>
                                            <td className="py-3 px-2 text-right font-bold text-green-600">
                                                ${payout.amount?.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-500">
                                                {new Date(payout.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
