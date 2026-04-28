"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Truck, CreditCard, Check, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function DeliveryProfileForm({ onComplete }) {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        cnicId: "",
        vehicleType: "bike",
        licenseNumber: "",
        serviceAreas: "",
        perDeliveryFee: "",
        availability: true,
        agreedToTerms: false,
        // Bank Details
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        iban: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                const profile = data.user?.deliveryProfile || {};
                const bankDetails = data.user?.payoutMethod?.bankDetails || {};

                setFormData({
                    fullName: profile.fullName || data.user?.name || "",
                    phone: profile.phone || "",
                    cnicId: profile.cnicId || "",
                    vehicleType: profile.vehicleType || "bike",
                    licenseNumber: profile.licenseNumber || "",
                    serviceAreas: profile.serviceAreas?.join(", ") || "",
                    perDeliveryFee: profile.perDeliveryFee || "",
                    availability: profile.availability !== false,
                    agreedToTerms: profile.agreedToTerms || false,
                    accountHolderName: bankDetails.accountHolderName || "",
                    accountNumber: bankDetails.accountNumber || "",
                    bankName: bankDetails.bankName || "",
                    iban: bankDetails.iban || "",
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreedToTerms) {
            toast.error("Please agree to the terms and conditions");
            return;
        }

        setLoading(true);
        try {
            const serviceAreasArray = formData.serviceAreas.split(",").map(s => s.trim()).filter(Boolean);

            const payload = {
                fullName: formData.fullName,
                phone: formData.phone,
                cnicId: formData.cnicId,
                vehicleType: formData.vehicleType,
                licenseNumber: formData.licenseNumber,
                serviceAreas: serviceAreasArray,
                perDeliveryFee: Number(formData.perDeliveryFee),
                availability: formData.availability,
                agreedToTerms: formData.agreedToTerms,
                payoutMethod: {
                    type: "bank_transfer",
                    bankDetails: {
                        accountHolderName: formData.accountHolderName,
                        accountNumber: formData.accountNumber,
                        bankName: formData.bankName,
                        iban: formData.iban,
                    }
                }
            };

            const res = await fetch("/api/profile/delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Profile updated successfully!");
                await update();
                if (onComplete) {
                    onComplete();
                } else {
                    router.push("/dashboard/delivery");
                }
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Delivery Profile Setup</h1>
                    <p className="text-muted-foreground">Manage your delivery settings and payout preferences.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                    <Truck className="h-4 w-4" />
                    <span>Delivery Partner</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Personal & Vehicle Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Personal Details</CardTitle>
                                <CardDescription>Your contact and identification information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1234567890"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="licenseNumber">License Number *</Label>
                                        <Input
                                            id="licenseNumber"
                                            name="licenseNumber"
                                            value={formData.licenseNumber}
                                            onChange={handleChange}
                                            placeholder="DL-12345678"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cnicId">CNIC Number *</Label>
                                        <Input
                                            id="cnicId"
                                            name="cnicId"
                                            value={formData.cnicId}
                                            onChange={handleChange}
                                            placeholder="12345-1234567-1"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Vehicle Information</CardTitle>
                                <CardDescription>Select the vehicle you will use for deliveries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {["bike", "car", "van"].map((type) => (
                                        <div
                                            key={type}
                                            className={`
                                                flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent dark:hover:bg-slate-800/50
                                                ${formData.vehicleType === type ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary" : "border-muted dark:border-slate-800"}
                                            `}
                                            onClick={() => setFormData(prev => ({ ...prev, vehicleType: type }))}
                                        >
                                            <div className="text-2xl mb-2">
                                                {type === "bike" ? "🏍️" : type === "car" ? "🚗" : "🚐"}
                                            </div>
                                            <span className="text-sm font-medium capitalize">{type}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Service Area</CardTitle>
                                <CardDescription>Where do you want to deliver?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="serviceAreas">Service Cities (Comma separated) *</Label>
                                    <Input
                                        id="serviceAreas"
                                        name="serviceAreas"
                                        value={formData.serviceAreas}
                                        onChange={handleChange}
                                        placeholder="New York, Brooklyn, Queens"
                                        className="h-12"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the specific cities or neighborhoods you cover.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Fees, Bank & Terms */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Pricing</CardTitle>
                                <CardDescription>Set your standard delivery fee</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="perDeliveryFee">Per Delivery Fee ($) *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <Input
                                            id="perDeliveryFee"
                                            name="perDeliveryFee"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.perDeliveryFee}
                                            onChange={handleChange}
                                            className="pl-7 text-lg font-medium"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This is your base fee for a standard delivery within your service area.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-900/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-400">
                                    <CreditCard className="h-5 w-5" />
                                    Payout Information
                                </CardTitle>
                                <CardDescription className="text-blue-700/80 dark:text-blue-400/70">
                                    Bank details for weekly earnings transfer
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name *</Label>
                                    <Input
                                        id="bankName"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        className="bg-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                    <Input
                                        id="accountHolderName"
                                        name="accountHolderName"
                                        value={formData.accountHolderName}
                                        onChange={handleChange}
                                        className="bg-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number *</Label>
                                    <Input
                                        id="accountNumber"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        className="bg-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="iban">IBAN (Optional)</Label>
                                    <Input
                                        id="iban"
                                        name="iban"
                                        value={formData.iban}
                                        onChange={handleChange}
                                        className="bg-white dark:bg-slate-950"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-0.5">
                                    <Label htmlFor="availability" className="text-base">Accepting New Orders</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Toggle to show/hide availability status
                                    </p>
                                </div>
                                <Switch
                                    id="availability"
                                    checked={formData.availability}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, availability: checked }))
                                    }
                                />
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-lg border border-muted bg-muted/20">
                                <input
                                    type="checkbox"
                                    id="agreedToTerms"
                                    name="agreedToTerms"
                                    checked={formData.agreedToTerms}
                                    onChange={handleChange}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="agreedToTerms" className="text-sm leading-tight cursor-pointer">
                                    I confirm that the information provided is accurate and I agree to the <span className="text-primary underline">Terms & Conditions</span> and <span className="text-primary underline">Delivery Partner Agreement</span>.
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all"
                                disabled={loading || !formData.agreedToTerms}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Profile...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Save & Activate Profile
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
