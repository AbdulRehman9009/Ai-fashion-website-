"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, X, ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";

export default function ProductForm({ product, onSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: product?.title || "",
        description: product?.description || "",
        category: product?.category || "Casual",
        basePrice: product?.basePrice || "",
        stock: product?.stock || 0,
        imageUrl: product?.images?.[0] || "",
        type: product?.type || "READY_TO_WEAR"
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (val) => {
        setFormData(prev => ({ ...prev, category: val }));
    };

    const handleImageChange = (url) => {
        setFormData(prev => ({ ...prev, imageUrl: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = product ? "PUT" : "POST";
            const body = {
                ...formData,
                _id: product?._id,
                images: [formData.imageUrl]
            };

            const res = await fetch("/api/products", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save product");

            toast.success(product ? "Product updated!" : "Product created!");
            if (onSuccess) onSuccess();
            else router.push("/dashboard/shopkeeper");

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title">Product Name</Label>
                    <Input id="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Red Silk Saree" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Wedding">Wedding</SelectItem>
                            <SelectItem value="Party">Party</SelectItem>
                            <SelectItem value="Casual">Casual</SelectItem>
                            <SelectItem value="Formal">Formal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="basePrice">Price ($)</Label>
                    <Input id="basePrice" type="number" min="0" value={formData.basePrice} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" min="0" value={formData.stock} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Product Type</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData(p => ({ ...p, type: val }))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="READY_TO_WEAR">Ready to Wear</SelectItem>
                            <SelectItem value="STITCHED">Stitched</SelectItem>
                            <SelectItem value="UNSTITCHED">Unstitched</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="Detailed product description..." rows={4} />
            </div>

            <ImageUpload
                value={formData.imageUrl}
                onChange={handleImageChange}
                label="Product Image"
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
                {onSuccess && <Button type="button" variant="outline" onClick={() => onSuccess(false)}>Cancel</Button>}
                <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {product ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
}
