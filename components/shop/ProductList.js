"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Loader2, PackageX, Eye } from "lucide-react";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const res = await axios.get("/api/products?role=SHOPKEEPER");
            // API returns paginated response: { data: [...], pagination: {...} }
            const productData = res.data?.data || [];
            setProducts(productData);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setProducts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    }

    async function deleteProduct(id) {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`/api/products?id=${id}`);
            toast.success("Product deleted");
            fetchProducts();
        } catch (e) {
            toast.error(e.response?.data?.error || "Failed to delete");
        }
    }

    const handleSuccess = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setIsDialogOpen(true);
    }

    const openNew = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    }

    if (loading) return (
        <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-orange-600 h-8 w-8" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Inventory</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your store products</p>
                </div>
                <Button onClick={openNew} className="bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" /> Add New Product
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProduct(null); }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>
                    <ProductForm product={editingProduct} onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                    {products.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"
                        >
                            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <PackageX className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No products found</p>
                            <p className="text-sm text-gray-400 mt-1">Start by adding your first product!</p>
                            <Button onClick={openNew} variant="outline" className="mt-4">
                                Add Product
                            </Button>
                        </motion.div>
                    ) : null}

                    {products.map((p, i) => (
                        <motion.div
                            key={p._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="overflow-hidden group h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="h-56 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                    {p.images?.[0] ? (
                                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                            <PackageX className="h-12 w-12 opacity-20" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 pt-4">
                                        <Button size="icon" variant="secondary" className="h-9 w-9 bg-white text-gray-900 hover:bg-gray-100 shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75" onClick={() => openEdit(p)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-9 w-9 shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100" onClick={() => deleteProduct(p._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        <Badge className={`${p.stock > 0 ? "bg-green-500/90 hover:bg-green-600" : "bg-red-500/90 hover:bg-red-600"} backdrop-blur-sm shadow-sm border-0`}>
                                            {p.stock > 0 ? "In Stock" : "Out of Stock"}
                                        </Badge>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                        <span className="text-white font-bold text-lg drop-shadow-md">${p.basePrice}</span>
                                    </div>
                                </div>

                                <CardContent className="p-5 space-y-3">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-2 text-base" title={p.title}>{p.title}</h4>
                                        </div>
                                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">{p.category}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full ${p.stock > 10 ? "bg-green-500" : p.stock > 0 ? "bg-yellow-500" : "bg-red-500"}`} />
                                            <span>{p.stock} units</span>
                                        </div>
                                        <span className="truncate max-w-[50%] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{p.type}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
