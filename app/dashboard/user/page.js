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
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

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
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Featured Shops</CardTitle>
                <CardDescription className="text-sm text-gray-500">Explore top-rated tailors and fabric stores</CardDescription>
              </div>
            </div>
            <Link href="/shops">
              <Button variant="outline" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {shops.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Store className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-900">No shops available yet</h3>
              <p className="text-sm text-gray-500">Check back soon for new additions.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <Link key={shop._id} href={`/shops/${shop._id}`}>
                  <div className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <div className="h-32 bg-gray-100 relative overflow-hidden">
                      {shop.banner ? (
                        <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-900/5 flex items-center justify-center">
                          <Store className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="-mt-10 mb-2 p-1 bg-white rounded-lg inline-block shadow-sm">
                          {shop.logo ? (
                            <img src={shop.logo} alt={shop.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                              <Store className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {shop.ratingCount > 0 && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs font-medium border border-gray-100">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{shop.ratingAvg?.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 truncate pr-2">{shop.name}</h3>

                      {shop.location?.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{shop.location.city}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500">View Collection</span>
                        <ArrowRight className="h-3 w-3 text-orange-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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

  return (
    <div className="min-h-screen pb-20">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {getTimeBasedGreeting()}, {session?.user?.name?.split(' ')[0] || "User"}
        </h2>
        <p className="text-gray-500 mt-1">Here's what's happening today.</p>
      </div>

      {/* Stats Cards - Business Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Orders</span>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeOrders}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.completedOrders}</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending Payment</span>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation - Clean Segmented Control */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <div className="flex space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-all ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`} />
              {tab.label}
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
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">AI Personal Stylist</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Get personalized outfit recommendations based on your unique features</CardDescription>
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

        {/* Shops Tab */}
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

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WishlistTab />
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
