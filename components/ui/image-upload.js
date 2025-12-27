"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ImageUpload({ value, onChange, disabled, label = "Upload Image" }) {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Upload failed");

            onChange(data.url);
            toast.success("Image uploaded");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-medium">{label}</p>}

            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative h-[200px] w-[200px] rounded-md overflow-hidden border">
                        <div className="absolute top-2 right-2 z-10">
                            <Button type="button" onClick={handleRemove} variant="destructive" size="icon">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <img src={value} alt="Upload" className="h-full w-full object-cover" />
                    </div>
                ) : (
                    <div className="h-[200px] w-[200px] rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            {loading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                disabled={loading || disabled}
                                onChange={handleUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
