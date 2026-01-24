"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";

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

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Your Inventory</h3>
                <Button onClick={openNew} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" /> Add New
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.length === 0 ? <p className="text-gray-500 col-span-full text-center py-10">No products found. Start adding some!</p> : null}

                {products.map(p => (
                    <Card key={p._id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gray-200 relative">
                            {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90" onClick={() => openEdit(p)}>
                                    <Edit className="h-4 w-4 text-gray-700" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteProduct(p._id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Badge className={`absolute top-2 left-2 ${p.stock > 0 ? "bg-green-500" : "bg-red-500"}`}>
                                {p.stock > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                        </div>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold truncate pr-2" title={p.title}>{p.title}</h4>
                                    <p className="text-xs text-gray-500">{p.category}</p>
                                </div>
                                <span className="font-bold text-lg">${p.basePrice}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                                <span>Stock: {p.stock}</span>
                                <span className="truncate max-w-[50%]">{p.type}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
