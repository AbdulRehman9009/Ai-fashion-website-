"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";
import PaddleWebhookSettings from "@/components/settings/PaddleWebhookSettings";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        image: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    name: data.name || "",
                    image: data.image || ""
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
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Profile updated!");
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-red-900" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Admin Settings</h2>

            {/* Profile Information */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold border-b pb-2">Profile Information</h3>

                <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Enter your name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <ImageUpload
                        value={formData.image}
                        onChange={(url) => setFormData(p => ({ ...p, image: url }))}
                        label=""
                    />
                    <p className="text-xs text-gray-500">Upload your profile photo (square image recommended).</p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-red-900 hover:bg-red-800">
                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>

            {/* Password Change */}
            <PasswordChangeForm />

            {/* Delete Account */}
            <DeleteAccountSection />

            {/* Paddle Webhook Settings (Admin) */}
            <PaddleWebhookSettings />
        </div>
    );
}

