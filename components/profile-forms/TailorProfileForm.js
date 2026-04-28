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
import ThemeToggle from "@/components/ui/ThemeToggle";

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
                const profile = data.user?.tailorProfile || {};
                const bankDetails = data.user?.payoutMethod?.bankDetails || {};

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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tailor Profile Setup</h1>
                    <p className="text-muted-foreground">Complete your professional profile to start receiving orders.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                    <Scissors className="h-4 w-4" />
                    <span>Professional Tailor</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Personal & Professional Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                                <CardDescription>Your basic contact and identification details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
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
                                            placeholder="+1234567890"
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
                                        placeholder="Identification Number"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Business Location</CardTitle>
                                <CardDescription>Where your tailoring shop is located</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Shop No. 123, Main Street"
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
                                            placeholder="New York"
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
                                            placeholder="NY"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Specializations</CardTitle>
                                <CardDescription>Select the types of clothing you specialize in</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {SPECIALIZATIONS.map((spec) => (
                                        <label
                                            key={spec}
                                            className={`
                                                flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-all hover:bg-accent
                                                ${formData.specialization.includes(spec) ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary" : "border-input"}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={formData.specialization.includes(spec)}
                                                onChange={() => handleSpecializationToggle(spec)}
                                            />
                                            <span className="text-sm font-medium">{spec}</span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Pricing, Bank & Terms */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Experience & Pricing</CardTitle>
                                <CardDescription>Set your rates and experience level</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience *</Label>
                                    <Input
                                        id="experience"
                                        name="experience"
                                        type="number"
                                        min="0"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full md:w-1/2"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>Pricing Model *</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`
                                                flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${formData.pricingType === "perJob" ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-muted hover:border-gray-300 dark:hover:border-slate-700"}
                                            `}
                                            onClick={() => setFormData(prev => ({ ...prev, pricingType: "perJob" }))}
                                        >
                                            <span className="font-semibold text-sm">Fixed Per Job</span>
                                            <span className="text-xs text-muted-foreground mt-1">Set a fixed rate</span>
                                        </div>
                                        <div
                                            className={`
                                                flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${formData.pricingType === "commission" ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-muted hover:border-gray-300 dark:hover:border-slate-700"}
                                            `}
                                            onClick={() => setFormData(prev => ({ ...prev, pricingType: "commission" }))}
                                        >
                                            <span className="font-semibold text-sm">Commission %</span>
                                            <span className="text-xs text-muted-foreground mt-1">Percentage of order</span>
                                        </div>
                                    </div>

                                    {formData.pricingType === "perJob" ? (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label htmlFor="pricePerJob">Price Per Job ($)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                                <Input
                                                    id="pricePerJob"
                                                    name="pricePerJob"
                                                    type="number"
                                                    className="pl-7"
                                                    min="1"
                                                    step="0.01"
                                                    value={formData.pricePerJob}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label htmlFor="commissionPercentage">Commission Percentage (%)</Label>
                                            <div className="relative">
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
                                                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                                            </div>
                                        </div>
                                    )}
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
                                        placeholder="Bank of America"
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
                                        placeholder="John Doe"
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
                                        placeholder="123456789"
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
                                        placeholder="US123456..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="space-y-0.5">
                                    <Label htmlFor="availability" className="text-base">Available for Work</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Toggle to show/hide yourself from new orders
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
                                    I confirm that the information provided is accurate and I agree to the <span className="text-primary underline">Terms & Conditions</span> and <span className="text-primary underline">Tailor Service Agreement</span>.
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
