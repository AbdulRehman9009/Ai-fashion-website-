"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";

export default function ShopSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo: "",
        banner: ""
    });

    useEffect(() => {
        fetchShop();
    }, []);

    async function fetchShop() {
        try {
            const res = await fetch("/api/shop");
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    name: data.name || "",
                    description: data.description || "",
                    logo: data.logo || "",
                    banner: data.banner || ""
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/shop", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Shop settings updated!");
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Shop Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border">

                <div className="space-y-2">
                    <Label htmlFor="name">Shop Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">About the Shop</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Tell your customers about your brand..."
                        rows={4}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Shop Logo</Label>
                        <ImageUpload
                            value={formData.logo}
                            onChange={(url) => setFormData(p => ({ ...p, logo: url }))}
                            label=""
                        />
                        <p className="text-xs text-gray-500">Square image recommended.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Shop Banner</Label>
                        <ImageUpload
                            value={formData.banner}
                            onChange={(url) => setFormData(p => ({ ...p, banner: url }))}
                            label=""
                        />
                        <p className="text-xs text-gray-500">Wide image for profile header.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
