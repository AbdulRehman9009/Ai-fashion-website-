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
                const profile = data.user.deliveryProfile || {};
                const bankDetails = data.user.payoutMethod?.bankDetails || {};

                setFormData({
                    fullName: profile.fullName || data.user.name || "",
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
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Complete Delivery Profile
                </CardTitle>
                <CardDescription>
                    Enter your delivery service details and payout information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Vehicle & License</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                                <select
                                    id="vehicleType"
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="bike">Motorbike</option>
                                    <option value="car">Car</option>
                                    <option value="van">Van</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License Number *</Label>
                                <Input
                                    id="licenseNumber"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Service Details</h3>
                        <div className="space-y-2">
                            <Label htmlFor="serviceAreas">Service Areas (Comma separated cities) *</Label>
                            <Input
                                id="serviceAreas"
                                name="serviceAreas"
                                placeholder="New York, Brooklyn, Queens"
                                value={formData.serviceAreas}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="perDeliveryFee">Per Delivery Fee ($) *</Label>
                            <Input
                                id="perDeliveryFee"
                                name="perDeliveryFee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.perDeliveryFee}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Bank Account for Payouts
                        </h3>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                Provide your bank account details to receive your earnings via bank transfer.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                <Input
                                    id="accountHolderName"
                                    name="accountHolderName"
                                    value={formData.accountHolderName}
                                    onChange={handleChange}
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
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name *</Label>
                                <Input
                                    id="bankName"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
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
                                />
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label htmlFor="availability">Currently Available for Work</Label>
                            <p className="text-sm text-gray-500">
                                Turn this off if you are not taking new deliveries.
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

                    {/* Terms */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="agreedToTerms"
                            name="agreedToTerms"
                            checked={formData.agreedToTerms}
                            onChange={handleChange}
                            className="mt-1"
                        />
                        <Label htmlFor="agreedToTerms" className="cursor-pointer text-sm">
                            I agree to the Terms & Conditions and Delivery Service Agreement *
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !formData.agreedToTerms}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Complete Profile
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
