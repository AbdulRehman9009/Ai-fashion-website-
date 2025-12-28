"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Scissors, MapPin, CreditCard, Check, Loader2, AlertCircle } from "lucide-react";

export default function TailorProfileForm({ onComplete }) {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        cnicId: "",
        address: "",
        city: "",
        state: "",
        specialization: [],
        experience: "",
        pricingType: "perJob",
        pricePerJob: "",
        commissionPercentage: "",
        availability: true,
        agreedToTerms: false,
        // Bank Details
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        iban: "",
    });

    const SPECIALIZATIONS = [
        "Formal Wear",
        "Wedding Dresses",
        "Casual Wear",
        "Traditional Wear",
        "Alterations",
        "Custom Tailoring",
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                const profile = data.user.tailorProfile || {};
                const bankDetails = data.user.payoutMethod?.bankDetails || {};

                setFormData({
                    name: data.user?.name || "",
                    phone: profile.phone || "",
                    cnicId: profile.cnicId || "",
                    address: profile.location?.address || "",
                    city: profile.location?.city || "",
                    state: profile.location?.state || "",
                    specialization: profile.specialization || [],
                    experience: profile.experience || "",
                    pricingType: profile.pricePerJob ? "perJob" : "commission",
                    pricePerJob: profile.pricePerJob || "",
                    commissionPercentage: profile.commissionPercentage || "",
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

    const handleSpecializationToggle = (spec) => {
        setFormData((prev) => ({
            ...prev,
            specialization: prev.specialization.includes(spec)
                ? prev.specialization.filter((s) => s !== spec)
                : [...prev.specialization, spec],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreedToTerms) {
            toast.error("Please agree to the terms and conditions");
            return;
        }

        if (formData.specialization.length === 0) {
            toast.error("Please select at least one specialization");
            return;
        }

        if (!formData.pricePerJob && !formData.commissionPercentage) {
            toast.error("Please provide either price per job or commission percentage");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                cnicId: formData.cnicId,
                address: formData.address,
                city: formData.city,
                experience: Number(formData.experience),
                specialization: formData.specialization,
                availability: formData.availability,
                agreedToTerms: formData.agreedToTerms,
                // Pricing
                pricePerJob: formData.pricingType === "perJob" ? Number(formData.pricePerJob) : undefined,
                commissionPercentage: formData.pricingType === "commission" ? Number(formData.commissionPercentage) : undefined,
                // Payout Method
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

            const res = await fetch("/api/profile/tailor", {
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
                    router.push("/dashboard/tailor");
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
                    <Scissors className="h-5 w-5" />
                    Complete Your Tailor Profile
                </CardTitle>
                <CardDescription>
                    Fill out your details to start accepting jobs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnicId">CNIC / ID Number *</Label>
                            <Input
                                id="cnicId"
                                name="cnicId"
                                value={formData.cnicId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Business Location
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Specialization */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Specializations *</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {SPECIALIZATIONS.map((spec) => (
                                <label
                                    key={spec}
                                    className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.specialization.includes(spec)}
                                        onChange={() => handleSpecializationToggle(spec)}
                                    />
                                    <span className="text-sm">{spec}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Experience & Pricing */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Experience & Pricing</h3>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience *</Label>
                            <Input
                                id="experience"
                                name="experience"
                                type="number"
                                min="0"
                                value={formData.experience}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Pricing Model *</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pricingType"
                                        value="perJob"
                                        checked={formData.pricingType === "perJob"}
                                        onChange={handleChange}
                                    />
                                    <span>Fixed Per Job</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pricingType"
                                        value="commission"
                                        checked={formData.pricingType === "commission"}
                                        onChange={handleChange}
                                    />
                                    <span>Commission %</span>
                                </label>
                            </div>

                            {formData.pricingType === "perJob" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="pricePerJob">Price Per Job ($) *</Label>
                                    <Input
                                        id="pricePerJob"
                                        name="pricePerJob"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={formData.pricePerJob}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="commissionPercentage">Commission Percentage (%) *</Label>
                                    <Input
                                        id="commissionPercentage"
                                        name="commissionPercentage"
                                        type="number"
                                        min="1"
                                        max="100"
                                        step="0.1"
                                        value={formData.commissionPercentage}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}
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
                                Customers can assign you jobs when available
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

                    {/* Terms Agreement */}
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
                            I agree to the Terms & Conditions and Tailor Service Agreement *
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
