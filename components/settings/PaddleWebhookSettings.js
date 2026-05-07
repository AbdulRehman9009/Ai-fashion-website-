"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";

export default function PaddleWebhookSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({ secret: "", verifyEnabled: true });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch("/api/admin/webhook-settings");
            const json = await res.json();
            if (res.ok) {
                setData(json.data || { secret: "", verifyEnabled: true });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/webhook-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success("Webhook settings saved");
            } else {
                const err = await res.json();
                throw new Error(err?.error || "Save failed");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-6 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-4 bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-semibold">Paddle Webhook</h3>

            <div>
                <Label>Webhook URL</Label>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/paddle/webhook` : '/api/paddle/webhook'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Use this URL in your Paddle dashboard (Developer → Webhooks)</p>
            </div>

            <div>
                <Label htmlFor="secret">Webhook Secret</Label>
                <Input
                    id="secret"
                    value={data.secret || ""}
                    onChange={(e) => setData(p => ({ ...p, secret: e.target.value }))}
                    placeholder="Paste your Paddle webhook secret"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="verify"
                    type="checkbox"
                    checked={!!data.verifyEnabled}
                    onChange={(e) => setData(p => ({ ...p, verifyEnabled: e.target.checked }))}
                    className="h-4 w-4"
                />
                <Label htmlFor="verify">Verify webhook signatures</Label>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                    {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Webhook
                </Button>
            </div>
        </form>
    );
}
