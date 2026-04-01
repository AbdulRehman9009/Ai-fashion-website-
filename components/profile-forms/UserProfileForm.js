"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { User, Ruler, Shirt, Check, Loader2, MapPin, Phone } from "lucide-react";

export default function UserProfileForm({ onComplete }) {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        height: "",
        weight: "",
        shirtSize: "",
        pantSize: "",
        shoeSize: "",
        preferredStyle: "Casual",
        newsletter: true
    });

    useEffect(() => {
        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile/customer");
            if (res.ok) {
                const data = await res.json();
                const profile = data.user?.customerProfile || data.customerProfile || {};
                setFormData({
                    name: data.name || data.user?.name || "",
                    phone: profile.phone || "",
                    address: profile.address || "",
                    city: profile.city || "",
                    state: profile.state || "",
                    zipCode: profile.zipCode || "",
                    height: profile.measurements?.height || "",
                    weight: profile.measurements?.weight || "",
                    shirtSize: profile.measurements?.shirtSize || "",
                    pantSize: profile.measurements?.pantSize || "",
                    shoeSize: profile.measurements?.shoeSize || "",
                    preferredStyle: profile.preferences?.style || "Casual",
                    newsletter: profile.preferences?.newsletter !== false
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

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                customerProfile: {
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    measurements: {
                        height: formData.height,
                        weight: formData.weight,
                        shirtSize: formData.shirtSize,
                        pantSize: formData.pantSize,
                        shoeSize: formData.shoeSize
                    },
                    preferences: {
                        style: formData.preferredStyle,
                        newsletter: formData.newsletter
                    }
                }
            };

            const res = await fetch("/api/profile/customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Profile updated successfully!");
                await update(); // Update session
                if (onComplete) {
                    onComplete();
                } else {
                    router.refresh(); // Refresh to clear warnings
                }
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information and measurements for better fitting.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-400">
                    <User className="h-4 w-4" />
                    <span>Valued Customer</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Col: Personal & Address */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    Personal Details
                                </CardTitle>
                                <CardDescription>Your contact information for orders</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input id="phone" name="phone" className="pl-9" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    Shipping Address
                                </CardTitle>
                                <CardDescription>Default address for deliveries</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Fashion Ave" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">Zip Code</Label>
                                    <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Measurements */}
                    <div className="space-y-6">
                        <Card className="border-purple-100 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-900/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-purple-900 dark:text-purple-400">
                                    <Ruler className="h-5 w-5" />
                                    Body Measurements
                                </CardTitle>
                                <CardDescription className="text-purple-700/80 dark:text-purple-400/70">
                                    Help us find the perfect fit for you (Optional)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="height">Height (cm)</Label>
                                        <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} placholder="175" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="70" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shirtSize">Shirt Size</Label>
                                    <Select name="shirtSize" value={formData.shirtSize} onValueChange={(v) => handleSelectChange("shirtSize", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="XS">XS</SelectItem>
                                            <SelectItem value="S">S</SelectItem>
                                            <SelectItem value="M">M</SelectItem>
                                            <SelectItem value="L">L</SelectItem>
                                            <SelectItem value="XL">XL</SelectItem>
                                            <SelectItem value="XXL">XXL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pantSize">Waist (in)</Label>
                                        <Input id="pantSize" name="pantSize" type="number" value={formData.pantSize} onChange={handleChange} placeholder="32" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shoeSize">Shoe Size (US)</Label>
                                        <Input id="shoeSize" name="shoeSize" type="number" value={formData.shoeSize} onChange={handleChange} placeholder="9" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shirt className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    Style Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Preferred Style</Label>
                                    <Select name="preferredStyle" value={formData.preferredStyle} onValueChange={(v) => handleSelectChange("preferredStyle", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Casual">Casual</SelectItem>
                                            <SelectItem value="Formal">Formal</SelectItem>
                                            <SelectItem value="Streetwear">Streetwear</SelectItem>
                                            <SelectItem value="Vintage">Vintage</SelectItem>
                                            <SelectItem value="Minimalist">Minimalist</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="newsletter" className="cursor-pointer font-normal">
                                        Receive personalized fashion recommendations
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full h-11 text-base shadow-md" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            {loading ? "Saving Profile..." : "Save Profile"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
