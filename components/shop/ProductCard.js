"use client";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { getProductImage, PRODUCT_IMAGE_FALLBACK, useProductImageFallback } from "@/lib/productImages";

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const imageSrc = getProductImage(product);
  const tags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={imageSrc}
          alt={product.title || "Product image"}
          onError={useProductImageFallback}
          className={`object-cover w-full h-full hover:scale-105 transition-transform duration-500 ${imageSrc === PRODUCT_IMAGE_FALLBACK ? "p-6" : ""}`}
        />
        {product.type === "READY_TO_WEAR" && (
          <span className="absolute top-2 right-2 bg-black/70 dark:bg-black/80 text-white text-xs px-2 py-1 rounded">Ready to Wear</span>
        )}
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
            <CardDescription className="text-sm text-gray-500 line-clamp-1">{product.category}</CardDescription>
          </div>
          <span className="font-bold text-lg">${product.basePrice}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{tag}</span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t dark:border-gray-700 gap-2">
        <Button className="flex-1 gap-2" variant="outline" onClick={() => onAddToCart && onAddToCart(product)}>
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </Button>
        <Button className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
          if (onAddToCart) onAddToCart(product);
          if (onBuyNow) onBuyNow(product);
        }}>
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
