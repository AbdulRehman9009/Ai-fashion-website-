"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Clock } from "lucide-react";

export default function CustomerPaymentsPage() {
    const { data: session } = useSession();
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch("/api/user/payments");
            if (res.ok) {
                const data = await res.json();
                setPayments(data.payments || []);
                setSummary(data.summary || {});
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
                <p className="text-muted-foreground">
                    View all your transactions and payment status
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Paid
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${summary?.totalPaid?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Successful payments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            ${summary?.totalPending?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting payment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Transactions
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.totalTransactions || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    {payments.length > 0 ? (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div
                                    key={payment._id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">Order #{payment.order?._id?.slice(-6) || "N/A"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(payment.createdAt).toLocaleDateString()} at{" "}
                                            {new Date(payment.createdAt).toLocaleTimeString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {payment.method || "Paddle"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${payment.amount?.toFixed(2)}</p>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${payment.status === "PAID" || payment.status === "completed"
                                                    ? "bg-green-50 text-green-700"
                                                    : payment.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No payment history yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
