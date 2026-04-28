"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { User, MapPin, Phone, Mail, Check, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function CustomerProfileForm({ onComplete }) {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "USA",
        measurementPreference: "manual",
        agreedToTerms: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.user?.name || "",
                    phone: data.profile?.phone || "",
                    email: data.user?.email || "",
                    street: data.profile?.addresses?.[0]?.street || "",
                    city: data.profile?.addresses?.[0]?.city || "",
                    state: data.profile?.addresses?.[0]?.state || "",
                    zip: data.profile?.addresses?.[0]?.zip || "",
                    country: data.profile?.addresses?.[0]?.country || "USA",
                    measurementPreference: data.profile?.preferences?.measurementPreference || "manual",
                    agreedToTerms: true,
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
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    addresses: [
                        {
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            zip: formData.zip,
                            country: formData.country,
                            isDefault: true,
                        },
                    ],
                    preferences: {
                        measurementPreference: formData.measurementPreference,
                    },
                }),
            });

            if (res.ok) {
                toast.success("Profile completed successfully!");
                await update(); // Refresh session
                if (onComplete) {
                    onComplete();
                } else {
                    router.push("/dashboard/user");
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
                    <User className="h-5 w-5" />
                    Complete Your Profile
                </CardTitle>
                <CardDescription>
                    Please fill out all required fields to start shopping
                </CardDescription>
            </CardHeader>
            <div className="p-2 flex justify-end">
                <ThemeToggle />
            </div>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Personal Information
                        </h3>
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
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address *</Label>
                            <Input
                                id="street"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
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
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip">ZIP Code *</Label>
                                <Input
                                    id="zip"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Measurement Preference */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Measurement Preference</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="measurementPreference"
                                    value="manual"
                                    checked={formData.measurementPreference === "manual"}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <span>Manual Entry</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="measurementPreference"
                                    value="tailor"
                                    checked={formData.measurementPreference === "tailor"}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <span>Tailor Measured</span>
                            </label>
                        </div>
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
                            I agree to the Terms & Conditions and Refund Policy *
                        </Label>
                    </div>

                    {/* Submit Button */}
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
