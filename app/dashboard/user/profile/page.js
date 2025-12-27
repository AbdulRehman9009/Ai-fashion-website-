"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Loader2, Save, User, MapPin, Ruler } from "lucide-react";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        zip: "",
        measurementChest: "",
        measurementWaist: "",
        measurementHips: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();

            if (res.ok) {
                setFormData({
                    name: data.profile.name || session?.user?.name || "",
                    email: session?.user?.email || "",
                    phone: data.profile.phone || "",
                    street: data.profile.addresses?.[0]?.street || "",
                    city: data.profile.addresses?.[0]?.city || "",
                    zip: data.profile.addresses?.[0]?.zip || "",
                    measurementChest: data.profile.measurements?.chest || "",
                    measurementWaist: data.profile.measurements?.waist || "",
                    measurementHips: data.profile.measurements?.hips || "",
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        zip: formData.zip
                    },
                    measurements: {
                        chest: parseFloat(formData.measurementChest) || 0,
                        waist: parseFloat(formData.measurementWaist) || 0,
                        hips: parseFloat(formData.measurementHips) || 0
                    }
                }),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            await update({ name: formData.name }); // Update session
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your personal information and measurements.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={formData.email} disabled className="bg-gray-100" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input id="street" value={formData.street} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" value={formData.city} onChange={handleChange} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="zip">ZIP / Postal Code</Label>
                                        <Input id="zip" value={formData.zip} onChange={handleChange} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" /> Measurements (in inches)</CardTitle>
                                <CardDescription>Optional: Help our tailors allow for better fit.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="measurementChest">Chest</Label>
                                    <Input id="measurementChest" type="number" step="0.1" value={formData.measurementChest} onChange={handleChange} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="measurementWaist">Waist</Label>
                                    <Input id="measurementWaist" type="number" step="0.1" value={formData.measurementWaist} onChange={handleChange} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="measurementHips">Hips</Label>
                                    <Input id="measurementHips" type="number" step="0.1" value={formData.measurementHips} onChange={handleChange} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-8 flex justify-end">
                            <Button type="submit" size="lg" disabled={loading} className="min-w-[150px]">
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Profile Image or Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500 mb-4 overflow-hidden">
                                {/* Placeholder since no real image upload for profile yet */}
                                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <Button variant="outline" className="w-full">Change Photo</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
