"use client";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopSection({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // In a real app, this would be an API call
    // We will simulate it for now by fetching all products if we had an API, 
    // or we can create a simple API endpoint for products.
    // Let's create a quick API endpoint for products first.
    fetch("/api/products")
        .then(res => res.json())
        .then(data => {
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Search products..." 
                className="pl-10" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
                <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
                <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <ProductCard product={product} onAddToCart={onAddToCart} />
                </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
