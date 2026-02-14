"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import OrdersList from "@/components/OrdersList";
import ShopSection from "@/components/shop/ShopSection";
import CheckoutDialog from "@/components/shop/CheckoutDialog";
import WishlistTab from "@/components/shop/WishlistTab";
import axios from "axios";
import Link from "next/link";
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
  Home,
  Store,
  MapPin,
  Star,
  ArrowRight,
  Heart,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";

// ShopsTab Component - Displays available shops
function ShopsTab() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await axios.get("/api/shops");
      setShops(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Featured Shops</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Explore top-rated tailors and fabric stores near you.</p>
        </div>
        <Link href="/shops">
          <Button variant="outline" size="sm" className="gap-2 text-gray-600 dark:text-gray-300 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <Store className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">No shops available yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Check back soon for new additions.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop, index) => (
            <motion.div
              key={shop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/shops/${shop._id}`} className="block h-full group">
                <div className="h-full border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 group-hover:-translate-y-1">
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    {shop.banner ? (
                      <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <Store className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg">
                        {shop.logo ? (
                          <img src={shop.logo} alt={shop.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}
                      </div>
                      {shop.ratingCount > 0 && (
                        <div className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-white shadow-sm">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{shop.ratingAvg?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{shop.name}</h3>

                    {shop.location?.city && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{shop.location.city}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm font-medium">
                      <span className="text-purple-600 dark:text-purple-400">View Collection</span>
                      <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    { id: "shops", label: "Shops", icon: Store },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "orders", label: "Orders", icon: List },
    { id: "shop", label: "Products", icon: ShoppingCart }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen pb-20 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {getTimeBasedGreeting()}, {session?.user?.name?.split(' ')[0] || "User"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ready to find your perfect style today?</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 rounded-xl hover:opacity-90 transition-opacity">
          <Sparkles className="mr-2 h-4 w-4" /> New AI Style Scan
        </Button>
      </div>

      {/* Stats Cards - Animated */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatsCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={ShoppingBag}
          trend="In Progress"
          description="orders being processed"
          color="blue"
        />
        <StatsCard
          title="Completed"
          value={stats.completedOrders}
          icon={CheckCircle}
          trend="Delivered"
          description="past successful orders"
          color="green"
        />
        <StatsCard
          title="Pending Payment"
          value={stats.pendingPayments}
          icon={Clock}
          trend="Action Needed"
          description="awaiting payment"
          color="orange"
        />
      </motion.div>

      {/* Tab Navigation - Premium Pill Style */}
      <div className="bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
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
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Input Form */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl">
                        <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Style Preferences</CardTitle>
                        <CardDescription>Let AI find your perfect look</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmitAIStylist)} className="space-y-6">
                      {/* Step 1: Photo Upload */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center justify-between">
                          <span>1. Upload Photo</span>
                          {imageFile && <span className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Ready</span>}
                        </Label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />

                        {imagePreview ? (
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Your photo"
                              className="w-full h-48 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <button
                                type="button"
                                onClick={clearImage}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transform scale-90 group-hover:scale-100 transition-all"
                              >
                                Remove Photo
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group"
                          >
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                              <Camera className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tap to upload</p>
                          </button>
                        )}
                      </div>

                      {/* Step 2: Event Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">2. Select Occasion</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {[{ id: "Casual", emoji: "👕" }, { id: "Party", emoji: "🎉" }, { id: "Wedding", emoji: "💒" }, { id: "Formal", emoji: "👔" }, { id: "Date", emoji: "💕" }, { id: "Work", emoji: "💼" }, { id: "Trip", emoji: "🏖️" }, { id: "Fest", emoji: "🎊" }].map((event) => (
                            <label
                              key={event.id}
                              className={`cursor-pointer rounded-xl p-2 text-center border transition-all ${watchEventType === event.id
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                            >
                              <input type="radio" value={event.id} {...register("eventType")} className="sr-only" />
                              <div className="text-xl mb-1">{event.emoji}</div>
                              <div className="text-[10px] font-medium uppercase tracking-wide opacity-70">{event.id}</div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Step 3: Preferences */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">3. Details (Optional)</Label>
                        <div className="space-y-3">
                          <select
                            {...register("skinTone")}
                            className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white"
                          >
                            <option value="">Auto-detect skin tone</option>
                            {["Fair - Cool", "Fair - Warm", "Medium - Cool", "Medium - Warm", "Olive", "Dark - Cool", "Dark - Warm"].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <Input {...register("stylePreferences")} placeholder="Any specific style notes?..." className="h-10 text-sm bg-white dark:bg-gray-900" />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/25 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={aiLoading}
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            {loadingMessages[loadingStep]}
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate My Style
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {!aiResults ? (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-6">
                        <Sparkles className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Style Guide Awaits</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Upload your photo and select an occasion to get personalized AI fashion recommendations tailored just for you.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Analysis Summary */}
                      <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white border-0 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <div className="flex items-center gap-2 text-purple-200 mb-1">
                                <Palette className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Style Analysis</span>
                              </div>
                              <h3 className="text-2xl font-bold">Your Personal Lookbook</h3>
                            </div>
                            <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                              {aiResults.analysis?.seasonalSuggestion || "All Season"}
                            </Badge>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                              <span className="text-xs text-purple-200 block mb-1">Skin Tone</span>
                              <span className="font-semibold">{aiResults.analysis?.skinTone || "Analyzed"}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                              <span className="text-xs text-purple-200 block mb-1">Occasion</span>
                              <span className="font-semibold">{watchEventType}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                              <span className="text-xs text-purple-200 block mb-1">Vibe</span>
                              <span className="font-semibold">Modern & Chic</span>
                            </div>
                          </div>

                          {aiResults.generalTips && (
                            <div className="bg-purple-900/50 rounded-lg p-4 border border-purple-500/30">
                              <p className="text-sm italic text-purple-100">"{aiResults.generalTips}"</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Recommendations Grid */}
                      <div className="grid gap-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" /> Suggested Outfits
                        </h3>
                        {aiResults.recommendations?.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Color Palette Strip */}
                              <div className="md:w-32 flex md:flex-col h-16 md:h-auto">
                                <div className="flex-1" style={{ backgroundColor: rec.colorCombination?.primary }} title={rec.colorNames?.[0]} />
                                <div className="flex-1" style={{ backgroundColor: rec.colorCombination?.secondary }} title={rec.colorNames?.[1]} />
                                <div className="flex-1" style={{ backgroundColor: rec.colorCombination?.accent }} title={rec.colorNames?.[2]} />
                              </div>

                              <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{rec.style}</h4>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {rec.outfitType}
                                      </Badge>
                                      {rec.colorNames?.map((c, ci) => (
                                        <span key={ci} className="text-xs text-gray-500 border border-gray-100 dark:border-gray-700 px-2 py-0.5 rounded-full">{c}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{rec.description}</p>

                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">Stylist Tip</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{rec.stylingTips}"</p>
                                </div>

                                {/* Matched Products */}
                                {rec.matchedProducts?.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Shop the Look</p>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                      {rec.matchedProducts.slice(0, 4).map((p, pi) => (
                                        <div key={pi} className="group relative flex-shrink-0 w-24">
                                          <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden mb-2">
                                            {p.image ? (
                                              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="h-6 w-6 text-gray-300" />
                                              </div>
                                            )}
                                            <button
                                              onClick={() => handleAddToCart(p)}
                                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <div className="bg-white text-black p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <ShoppingBag className="h-4 w-4" />
                                              </div>
                                            </button>
                                          </div>
                                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{p.title}</p>
                                          <p className="text-xs font-bold text-gray-900 dark:text-white">${p.price}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shops Tab - Wrapped with better container */}
        {activeTab === "shops" && (
          <motion.div
            key="shops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ShopsTab />
          </motion.div>
        )}

        {activeTab === "wishlist" && (
          <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <WishlistTab />
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order History</h3>
              </div>
              <div className="p-0">
                <OrdersList role="USER" key={refreshOrders} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "shop" && (
          <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ShopSection onAddToCart={handleAddToCart} />
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutDialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        product={selectedProduct}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp = true, description, color }) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-teal-500",
    orange: "from-orange-500 to-amber-500",
    purple: "from-purple-500 to-pink-500",
  };

  const lightColors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom, var(--${color}-500), transparent)` }} />

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${lightColors[color]} dark:bg-${color}-900/30 dark:text-${color}-400 ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
              <Icon className="h-5 w-5" />
            </div>
            {trend && (
              <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'} dark:text-${color}-400`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center text-xs text-gray-400">
            <span>{description}</span>
            <ArrowUpRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
