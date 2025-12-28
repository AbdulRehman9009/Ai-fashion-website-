"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { DollarSign, Send, Archive, Loader2, AlertCircle } from "lucide-react";

export default function AdminPayoutsPage() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [reference, setReference] = useState("");

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await fetch("/api/admin/payouts");
            if (res.ok) {
                const data = await res.json();
                setCandidates(data.candidates || []);
            }
        } catch (error) {
            console.error("Error fetching candidates:", error);
            toast.error("Failed to load payout candidates");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(candidates.map(c => c.userId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (userId, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, userId]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== userId));
        }
    };

    const handleProcessPayout = async () => {
        if (selectedIds.length === 0) return;
        if (!reference) {
            toast.error("Please enter a payment reference (e.g. Batch #101)");
            return;
        }

        if (!confirm(`Are you sure you want to mark ${selectedIds.length} payouts as PAID? This cannot be undone.`)) {
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch("/api/admin/payouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedIds, reference }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                toast.success(`Successfully processed ${result.payoutsProcessed} payouts!`);
                setSelectedIds([]);
                setReference("");
                fetchCandidates(); // Refresh list
            } else {
                toast.error(result.error || "Failed to process payouts");
            }
        } catch (error) {
            console.error("Error processing payouts:", error);
            toast.error("An error occurred");
        } finally {
            setProcessing(false);
        }
    };

    const totalSelectedAmount = candidates
        .filter(c => selectedIds.includes(c.userId))
        .reduce((sum, c) => sum + c.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payout Management</h2>
                    <p className="text-muted-foreground">
                        Review and process vendor payouts
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Selected Total</p>
                        <p className="text-lg font-bold text-green-600">${totalSelectedAmount.toFixed(2)}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Ref # (e.g. OCT-24)"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-32 h-9"
                        />
                        <Button
                            onClick={handleProcessPayout}
                            disabled={selectedIds.length === 0 || processing || !reference}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Pay Selected
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Payouts</CardTitle>
                    <CardDescription>Vendors with available balance ready for withdrawal</CardDescription>
                </CardHeader>
                <CardContent>
                    {candidates.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-200" />
                            <p>All caught up! No pending payouts.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedIds.length === candidates.length && candidates.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Bank Details</TableHead>
                                    <TableHead>Available Amount</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {candidates.map((candidate) => (
                                    <TableRow key={candidate.userId} className={selectedIds.includes(candidate.userId) ? "bg-slate-50" : ""}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(candidate.userId)}
                                                onCheckedChange={(checked) => handleSelectOne(candidate.userId, checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{candidate.name}</div>
                                            <div className="text-xs text-muted-foreground">{candidate.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{candidate.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {candidate.payoutMethod?.bankDetails ? (
                                                <div className="text-xs space-y-0.5">
                                                    <p className="font-medium">{candidate.payoutMethod.bankDetails.bankName}</p>
                                                    <p>{candidate.payoutMethod.bankDetails.accountNumber}</p>
                                                    <p className="text-muted-foreground">{candidate.payoutMethod.bankDetails.accountHolderName}</p>
                                                </div>
                                            ) : (
                                                <Badge variant="destructive" className="text-xs">Missing Bank Info</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-green-600">${candidate.amount.toFixed(2)}</div>
                                            <div className="text-xs text-muted-foreground">{candidate.count} transactions</div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(candidate.lastEarning).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-sm text-yellow-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                    <p className="font-semibold">Important Note for FYP Demo:</p>
                    <p>
                        Due to regional restrictions, this system uses a "Manual Payout" model.
                        The admin (you) must physically/digitally transfer funds to the vendor's bank account shown above.
                        Once the transfer is done, select the vendor here and click "Pay Selected" to mark the earnings as PAID in the system.
                    </p>
                </div>
            </div>
        </div>
    );
}

function CheckCircle(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
