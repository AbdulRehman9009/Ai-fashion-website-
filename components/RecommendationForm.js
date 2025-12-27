"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Sparkles, X, Camera, Palette, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function RecommendationForm({ onProductSelect }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [eventType, setEventType] = useState("Casual");
  const [prefs, setPrefs] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Start, 1: Uploading, 2: Analyzing, 3: Matching
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload an image first!");
      return;
    }

    setLoading(true);
    setLoadingStep(1);
    setResults(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("eventType", eventType);
    formData.append("preferences", JSON.stringify({ style: prefs }));

    try {
      // Simulate steps for UX
      setTimeout(() => setLoadingStep(2), 1000);
      setTimeout(() => setLoadingStep(3), 2500);

      const res = await fetch("/api/recommendations", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate recommendations");

      // Ensure we show the final step briefly
      setTimeout(() => {
        setResults(data);
        setLoading(false);
        setLoadingStep(0);
        toast.success("Outfit generated successfully!");
      }, 1000); // Artificial delay to let step 3 show

    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const loadingMessages = [
    "Preparing...",
    "Uploading your photo...",
    "Analyzing skin tone & body shape...",
    "Curating the perfect outfits..."
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">AI Stylist</CardTitle>
          </div>
          <CardDescription className="text-base">
            Upload a photo and tell us the occasion. Our AI will curate a personalized look just for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Area */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">1. Upload Your Photo</Label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${preview ? 'border-purple-500' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                <Input
                  ref={fileInputRef}
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {preview ? (
                  <div className="relative inline-block group">
                    <img src={preview} alt="Preview" className="max-h-64 rounded-xl shadow-md" />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer space-y-4 py-8"
                  >
                    <div className="bg-gray-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="occasion" className="text-lg font-medium">2. The Occasion</Label>
                <select
                  id="occasion"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  {["Casual", "Party", "Wedding", "Formal", "Date Night", "Office", "Vacation"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="prefs" className="text-lg font-medium">3. Style Preferences <span className="text-sm font-normal text-gray-500">(Optional)</span></Label>
                <Input
                  id="prefs"
                  value={prefs}
                  onChange={(e) => setPrefs(e.target.value)}
                  placeholder="e.g. I prefer dark colors, minimal patterns..."
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {loadingMessages[loadingStep]}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Generate My Look
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Analysis Card */}
            <Card className="bg-indigo-900 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-32 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Palette className="h-6 w-6 text-purple-300" /> AI Lifestyle Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid md:grid-cols-3 gap-6 text-indigo-100">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wider opacity-70">Skin Tone Match</p>
                    <p className="text-xl font-semibold mt-1">{results.analysis.skinTone}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wider opacity-70">Body Type</p>
                    <p className="text-xl font-semibold mt-1">{results.analysis.bodyShape}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wider opacity-70">Best Colors</p>
                    <p className="text-xl font-semibold mt-1">{results.analysis.ageGroup || "Vibrant Palette"}</p>
                  </div>
                </div>
                <div className="mt-6 p-5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-indigo-50 leading-relaxed italic">"{results.analysis.stylingTips}"</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Grid */}
            <h3 className="text-2xl font-bold text-gray-900">Curated For You</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {results.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-200 relative">
                    <img
                      src={rec.product.imageUrl || "/placeholder-outfit.jpg"}
                      alt={rec.product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {rec.confidenceScore}% Match
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="font-bold text-xl text-gray-900 line-clamp-1">{rec.product.name}</h4>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{rec.reason}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold text-indigo-600">${rec.product.price}</span>
                      <div className="flex gap-2">
                        {rec.product.isStitched && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">Stitched</span>}
                        {!rec.product.isStitched && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">Unstitched</span>}
                      </div>
                    </div>

                    <Button
                      onClick={() => onProductSelect && onProductSelect(rec.product)}
                      className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-11"
                    >
                      <Ruler className="mr-2 h-4 w-4" /> Customize & Buy
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
