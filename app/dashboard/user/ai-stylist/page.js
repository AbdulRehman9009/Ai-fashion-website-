"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RecommendationForm from "@/components/RecommendationForm";
import { useCart } from "@/contexts/CartContext";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function AIStylistPage() {
    const router = useRouter();
    const { addToCart } = useCart();
    const [processing, setProcessing] = useState(false);

    const handleProductSelect = async (product) => {
        setProcessing(true);
        try {
            // Product from recommendation might need mapping to match Cart structure
            // Assuming recommendation returns a product object compatible with addToCart
            // usually addToCart takes an ID. 
            // RecommendationForm.js line 263 passes 'rec.product'. 
            // We need product._id.

            if (!product || !product._id) {
                toast.error("Invalid product selected");
                return;
            }

            const success = await addToCart(product._id, 1);
            if (success) {
                toast.success("Redirecting to checkout...");
                router.push("/checkout");
            }
        } catch (error) {
            console.error("AI Cart Error:", error);
            toast.error("Failed to process selection");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">AI Personal Stylist</h1>
            <p className="text-gray-500 mb-8">
                Upload your photo and let our AI curate the perfect outfit for you.
            </p>

            {processing && (
                <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                </div>
            )}

            <RecommendationForm onProductSelect={handleProductSelect} />
        </div>
    );
}
