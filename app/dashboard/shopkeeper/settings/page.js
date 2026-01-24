"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Store, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import ShopkeeperProfileForm from "@/components/profile-forms/ShopkeeperProfileForm";

export default function ShopkeeperSettingsPage() {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchShop();
    }, []);

    const fetchShop = async () => {
        try {
            const res = await axios.get("/api/shop");
            setShop(res.data);
        } catch (error) {
            console.error("Error fetching shop:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async () => {
        setUpdating(true);
        try {
            const newVisibility = !shop.isVisibleToCustomers;
            await axios.put("/api/shop", {
                name: shop.name,
                isActive: newVisibility,
                isVisibleToCustomers: newVisibility
            });
            setShop(prev => ({
                ...prev,
                isActive: newVisibility,
                isVisibleToCustomers: newVisibility
            }));
            toast.success(newVisibility ? "Shop is now visible to customers!" : "Shop is now hidden from customers");
        } catch (error) {
            toast.error("Failed to update visibility");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Shop Settings</h2>
                <p className="text-muted-foreground">
                    Manage your shop profile and business information
                </p>
            </div>

            {/* Shop Visibility Card */}
            <Card className={shop?.isVisibleToCustomers ? "border-green-200 bg-green-50/30" : "border-yellow-200 bg-yellow-50/30"}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {shop?.isVisibleToCustomers ? (
                            <>
                                <Eye className="h-5 w-5 text-green-600" />
                                <span className="text-green-800">Shop is Visible</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="h-5 w-5 text-yellow-600" />
                                <span className="text-yellow-800">Shop is Hidden</span>
                            </>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {shop?.isVisibleToCustomers
                            ? "Customers can see your products and place orders."
                            : "Your products are not visible to customers. Toggle to go live!"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={shop?.isVisibleToCustomers || false}
                                onCheckedChange={toggleVisibility}
                                disabled={updating}
                            />
                            <Label>Show my shop to customers</Label>
                        </div>
                        {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>

                    {!shop?.profileCompletion?.isComplete && (
                        <div className="mt-4 p-3 bg-yellow-100 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <strong>Complete your profile first!</strong> Some information is missing.
                                Fill out the form below to enable your shop.
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Profile Form */}
            <ShopkeeperProfileForm onComplete={fetchShop} />
        </div>
    );
}
