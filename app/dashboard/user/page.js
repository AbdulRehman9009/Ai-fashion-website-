"use client";
import { useState } from "react";
import RecommendationForm from "@/components/RecommendationForm";
import OrdersList from "@/components/OrdersList";
import ShopSection from "@/components/shop/ShopSection";
import CheckoutDialog from "@/components/shop/CheckoutDialog";
import { motion } from "framer-motion";

// Simple Tabs implementation if shadcn tabs not present, 
// but I should try to use them if I can. 
// Since I haven't created tabs.js yet, I'll create a simple inline version or create the component.
// I'll create the component first to be professional.

export default function UserDashboard() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshOrders, setRefreshOrders] = useState(0);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleOrderSuccess = () => {
    setRefreshOrders(prev => prev + 1);
    setActiveTab("overview"); // Switch back to overview to see the new order
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
           <p className="text-gray-500">Welcome back! Manage your style and orders.</p>
        </div>
      </motion.div>
      
      <div className="space-y-4">
        <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 w-fit">
            <button
                onClick={() => setActiveTab("overview")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${activeTab === "overview" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
                Overview
            </button>
            <button
                onClick={() => setActiveTab("shop")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${activeTab === "shop" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
                Browse Shop
            </button>
        </div>

        {activeTab === "overview" && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid gap-6 lg:grid-cols-7"
            >
                <div className="lg:col-span-4 space-y-6">
                    <RecommendationForm />
                </div>
                <div className="lg:col-span-3">
                    <OrdersList role="USER" key={refreshOrders} />
                </div>
            </motion.div>
        )}

        {activeTab === "shop" && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <ShopSection onAddToCart={handleAddToCart} />
            </motion.div>
        )}
      </div>

      <CheckoutDialog 
        open={!!selectedProduct} 
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        product={selectedProduct}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}
