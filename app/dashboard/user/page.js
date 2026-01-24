"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import OrdersList from "@/components/OrdersList";
import ShopSection from "@/components/shop/ShopSection";
import CheckoutDialog from "@/components/shop/CheckoutDialog";
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  List,
  Sparkles,
  Loader2,
  Palette,
  ShoppingCart,
  Camera,
  X,
  Wand2,
  Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const EVENT_TYPES = [
  { id: "Casual", emoji: "👕" },
  { id: "Party", emoji: "🎉" },
  { id: "Wedding", emoji: "💒" },
  { id: "Formal", emoji: "👔" },
  { id: "Date Night", emoji: "💕" },
  { id: "Office", emoji: "💼" },
  { id: "Vacation", emoji: "🏖️" },
  { id: "Festival", emoji: "🎊" }
];

const SKIN_TONES = [
  "Fair - Cool undertones",
  "Fair - Warm undertones",
  "Medium - Cool undertones",
  "Medium - Warm undertones",
  "Olive",
  "Dark - Cool undertones",
  "Dark - Warm undertones"
];

export default function UserDashboard() {
  const { data: session } = useSession();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("stylist");
  const [refreshOrders, setRefreshOrders] = useState(0);
  const [stats, setStats] = useState({ activeOrders: 0, completedOrders: 0, pendingPayments: 0 });

  // AI Stylist State
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiResults, setAiResults] = useState(null);

  // Image Upload State - Single upload option
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);

  // React Hook Form
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      eventType: "Casual",
      skinTone: "",
      stylePreferences: ""
    }
  });

  const watchEventType = watch("eventType");

  useEffect(() => {
    fetchStats();
  }, [refreshOrders]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/user/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  // Image handling functions
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');

    setUploadedUrl(data.url);
    return data.url;
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
  };

  const handleOrderSuccess = () => {
    setRefreshOrders((prev) => prev + 1);
    fetchStats();
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // AI Stylist Form Submit
  const onSubmitAIStylist = async (data) => {
    if (!imageFile) {
      toast.error("Please upload your photo first!");
      return;
    }

    setAiLoading(true);
    setLoadingStep(1);
    setAiResults(null);

    try {
      // Step 1: Upload image
      const imageUrl = uploadedUrl || await uploadImage();
      if (!imageUrl) throw new Error("Failed to upload image");

      setLoadingStep(2);
      await new Promise(r => setTimeout(r, 500));
      setLoadingStep(3);

      // Step 2: Call AI Stylist API
      const response = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          eventType: data.eventType,
          skinTone: data.skinTone,
          preferences: { style: data.stylePreferences }
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to generate recommendations");

      setAiResults(result.data);
      toast.success("Your personalized style guide is ready!");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setAiLoading(false);
      setLoadingStep(0);
    }
  };

  const loadingMessages = [
    "Starting...",
    "Uploading photo...",
    "Analyzing features...",
    "Creating your style..."
  ];

  const tabs = [
    { id: "stylist", label: "AI Stylist", icon: Sparkles },
    { id: "orders", label: "Orders", icon: List },
    { id: "shop", label: "Shop", icon: ShoppingCart }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 sm:p-6 rounded-2xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getTimeBasedGreeting()}, {session?.user?.name?.split(' ')[0] || "there"}! 👋
            </h1>
            <p className="text-purple-100 text-sm sm:text-base mt-1">
              Get AI-powered outfit recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Active</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.activeOrders}</p>
              </div>
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Done</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Pending</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation - Mobile Friendly */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 flex-1 min-w-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <tab.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* AI Stylist Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "stylist" && (
          <motion.div
            key="stylist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI Style Consultant</CardTitle>
                    <CardDescription>Upload a photo & get personalized recommendations</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit(onSubmitAIStylist)} className="space-y-6">

                  {/* Step 1: Photo Upload - SINGLE UPLOAD AREA */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <span className="bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">1</span>
                      Your Photo
                    </Label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Your photo"
                          className="h-40 sm:h-48 rounded-xl object-cover shadow-md"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                      >
                        <Camera className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="font-medium text-gray-700">Tap to upload photo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </button>
                    )}
                  </div>

                  {/* Step 2: Event Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <span className="bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">2</span>
                      Occasion
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {EVENT_TYPES.map((event) => (
                        <label
                          key={event.id}
                          className={`cursor-pointer rounded-lg p-2 sm:p-3 text-center border-2 transition-all ${watchEventType === event.id
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <input
                            type="radio"
                            value={event.id}
                            {...register("eventType")}
                            className="sr-only"
                          />
                          <div className="text-lg sm:text-xl">{event.emoji}</div>
                          <div className="text-xs font-medium mt-1 truncate">{event.id}</div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Optional Preferences */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <span className="bg-gray-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
                      Preferences <span className="text-gray-400 font-normal text-sm">(optional)</span>
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <select
                        {...register("skinTone")}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Skin tone (AI detects)</option>
                        {SKIN_TONES.map((tone) => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                      <Input
                        {...register("stylePreferences")}
                        placeholder="Style notes..."
                        className="h-11 text-sm"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg"
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {loadingMessages[loadingStep]}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Generate My Style Guide
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* AI Results */}
            {aiResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Analysis Card */}
                <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-0 overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-purple-300" />
                      <h3 className="font-bold text-lg">Your Style Analysis</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                      <div className="bg-white/10 p-3 rounded-lg text-center">
                        <p className="text-xs text-purple-200">Skin Tone</p>
                        <p className="font-semibold text-sm mt-1">{aiResults.analysis?.skinTone || "Analyzed"}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg text-center">
                        <p className="text-xs text-purple-200">Occasion</p>
                        <p className="font-semibold text-sm mt-1">{aiResults.analysis?.occasion?.split(' - ')[0] || watchEventType}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg text-center">
                        <p className="text-xs text-purple-200">Season</p>
                        <p className="font-semibold text-sm mt-1">{aiResults.analysis?.seasonalSuggestion || "All"}</p>
                      </div>
                    </div>
                    {aiResults.generalTips && (
                      <p className="text-sm text-purple-100 italic">"{aiResults.generalTips}"</p>
                    )}
                  </CardContent>
                </Card>

                {/* Color Palettes */}
                <h3 className="text-lg font-bold">Recommended Palettes</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {aiResults.recommendations?.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden border"
                    >
                      {/* Color Bars */}
                      <div className="flex h-16">
                        <div className="flex-1" style={{ backgroundColor: rec.colorCombination?.primary }} title={rec.colorNames?.[0]} />
                        <div className="flex-1" style={{ backgroundColor: rec.colorCombination?.secondary }} title={rec.colorNames?.[1]} />
                        <div className="flex-1" style={{ backgroundColor: rec.colorCombination?.accent }} title={rec.colorNames?.[2]} />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold">{rec.style}</h4>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{rec.outfitType}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rec.colorNames?.map((c, ci) => (
                            <span key={ci} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c}</span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                        <p className="text-xs text-gray-500"><strong>Tip:</strong> {rec.stylingTips}</p>

                        {/* Matched Products */}
                        {rec.matchedProducts?.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-gray-500 mb-2">SHOP THESE</p>
                            <div className="flex gap-2">
                              {rec.matchedProducts.slice(0, 3).map((p, pi) => (
                                <button
                                  key={pi}
                                  onClick={() => handleAddToCart(p)}
                                  className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden hover:ring-2 hover:ring-purple-500 transition"
                                  title={p.title}
                                >
                                  {p.image ? (
                                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <ShoppingBag className="h-5 w-5 m-auto text-gray-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle>My Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-4">
                <OrdersList role="USER" key={refreshOrders} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ShopSection onAddToCart={handleAddToCart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        product={selectedProduct}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}
