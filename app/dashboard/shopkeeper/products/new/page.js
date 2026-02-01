"use client";
import ProductForm from "@/components/shop/ProductForm";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/dashboard/shopkeeper/products"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new product for your shop</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <ProductForm />
            </div>
        </div>
    );
}
