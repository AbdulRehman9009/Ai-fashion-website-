"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    Loader2,
    Eye,
    AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductForm from "@/components/shop/ProductForm";

export default function ShopkeeperProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/products?role=SHOPKEEPER");
            const productData = res.data?.data || [];
            setProducts(productData);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await axios.delete(`/api/products?id=${id}`);
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete product");
        }
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/50 p-2 sm:p-3 rounded-full">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Products</h2>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Manage your product catalog</p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => setEditingProduct(null)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        </DialogHeader>
                        <ProductForm
                            product={editingProduct}
                            onSuccess={handleSuccess}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <Card className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No products found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {searchQuery ? "Try a different search term" : "Add your first product to get started"}
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-12 w-12 text-gray-300" />
                                    </div>
                                )}
                                <Badge
                                    className="absolute top-2 right-2"
                                    variant={product.isActive ? "default" : "secondary"}
                                >
                                    {product.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            <CardContent className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>

                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-orange-600">
                                        ${product.basePrice?.toFixed(2)}
                                    </span>
                                    <Badge variant="outline">{product.type}</Badge>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
