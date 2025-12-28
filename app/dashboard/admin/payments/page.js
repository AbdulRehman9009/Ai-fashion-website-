"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export default function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // In a real app we'd have a dedicated API for this, 
        // but for now we can mock or use a broader fetch.
        // Let's assume we fetch all orders that are paid.
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            // NOTE: reusing orders API for now, would ideally be /api/admin/payments
            const res = await fetch("/api/orders?status=paid"); // Assuming this exists or works
            if (res.ok) {
                // This is a placeholder as we haven't built the full admin payments API yet
                // For now, let's just show a clear message or empty state if API not ready
                setTransactions([]);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Payment Monitoring</h2>
                <p className="text-muted-foreground">Live view of all incoming payments via Paddle</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button size="icon" variant="ghost">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No transactions found (Feature pending simplified order API integration)
                        </div>
                    ) : (
                        <Table>
                            {/* Table content would go here */}
                        </Table>
                    )}
                    <div className="mt-8 p-4 bg-slate-50 rounded text-sm text-slate-500">
                        <p><strong>Note:</strong> Transaction history is primarily tracked in the Paddle Dashboard. Use this page for a quick overview of system-recorded payments.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
