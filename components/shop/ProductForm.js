"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Package, DollarSign, Layers, Tag, FileText, Image as ImageIcon, Sparkles, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import axios from "axios";

const CATEGORIES = [
    { value: "Wedding", label: "Wedding", icon: "💒" },
    { value: "Party", label: "Party", icon: "🎉" },
    { value: "Casual", label: "Casual", icon: "👕" },
    { value: "Formal", label: "Formal", icon: "👔" }
];

const PRODUCT_TYPES = [
    { value: "READY_TO_WEAR", label: "Ready to Wear", description: "Pre-made, ready for purchase" },
    { value: "STITCHED", label: "Stitched", description: "Custom stitched clothing" },
    { value: "UNSTITCHED", label: "Unstitched", description: "Raw fabric for tailoring" }
];

export default function ProductForm({ product, onSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: product?.title || "",
        description: product?.description || "",
        category: product?.category || "Casual",
        basePrice: product?.basePrice || "",
        stock: product?.stock || 0,
        imageUrl: product?.images?.[0] || "",
        type: product?.type || "READY_TO_WEAR",
        audience: product?.audience || ""
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.audience) {
            toast.error("Please select a Gender.");
            return;
        }
        setLoading(true);

        try {
            const method = product ? "put" : "post";
            const body = {
                ...formData,
                _id: product?._id,
                images: formData.imageUrl ? [formData.imageUrl] : []
            };

            await axios[method]("/api/products", body);
            toast.success(product ? "Product updated successfully!" : "Product created successfully!");

            if (onSuccess) onSuccess();
            else router.push("/dashboard/shopkeeper/products");

        } catch (err) {
            toast.error(err.response?.data?.error || err.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    const generateAIDetails = async () => {
        if (!formData.title && !formData.imageUrl) {
            toast.error("Please provide a title or upload an image first for AI to analyze.");
            return;
        }

        setAiLoading(true);
        try {
            const res = await axios.post("/api/ai-product-details", {
                title: formData.title,
                category: formData.category,
                imageUrl: formData.imageUrl
            });

            const data = res.data;
            if (data.description) {
                setFormData(prev => ({
                    ...prev,
                    description: data.description,
                    audience: data.audience || prev.audience,
                    type: data.type || prev.type
                }));
                toast.success("AI generated details successfully!");
            }
        } catch (err) {
            toast.error("Failed to generate AI details");
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Info */}
            {!product && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50">
                    <div className="p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg">
                        <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-800 dark:text-orange-300">Auto-Sync with Paddle</h3>
                        <p className="text-sm text-orange-600 dark:text-orange-400">Your product will be automatically set up for card payments</p>
                    </div>
                </div>
            )}

            {/* Basic Information */}
            <Card className="border border-gray-100 dark:border-gray-800/60 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={generateAIDetails}
                            disabled={aiLoading}
                            className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/30"
                        >
                            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Auto-fill with AI
                        </Button>
                    </div>
                    <CardDescription>Enter the product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            Product Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Elegant Red Silk Saree"
                            className="h-11"
                        />
                    </div>

                    {/* Category, Type, and Gender - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-gray-500" />
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.category} onValueChange={(val) => setFormData(p => ({ ...p, category: val }))}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            <span className="flex items-center gap-2">
                                                <span>{cat.icon}</span>
                                                <span>{cat.label}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                Product Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData(p => ({ ...p, type: val }))}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRODUCT_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{type.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                Gender <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.audience} onValueChange={(val) => setFormData(p => ({ ...p, audience: val }))}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEN">Men</SelectItem>
                                    <SelectItem value="WOMEN">Women</SelectItem>
                                    <SelectItem value="UNISEX">Unisex</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your product in detail..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Pricing & Stock */}
            <Card className="border border-gray-100 dark:border-gray-800/60 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
                    </div>
                    <CardDescription>Set your product price and stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="basePrice" className="flex items-center gap-2">
                                Price (USD) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
                                <Input
                                    id="basePrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.basePrice}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                    className="h-11 pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock" className="flex items-center gap-2">
                                Stock Quantity <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                placeholder="0"
                                className="h-11"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Product Image */}
            <Card className="border border-gray-100 dark:border-gray-800/60 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <CardTitle className="text-lg">Product Image</CardTitle>
                    </div>
                    <CardDescription>Upload a high-quality image of your product</CardDescription>
                </CardHeader>
                <CardContent>
                    <ImageUpload
                        value={formData.imageUrl}
                        onChange={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                        label=""
                    />
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                {onSuccess && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSuccess(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 h-11"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            {product ? "Updating..." : "Creating..."}
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {product ? "Update Product" : "Create Product"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
