"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RecommendationForm() {
  const [file, setFile] = useState(null);
  const [eventType, setEventType] = useState("Casual");
  const [prefs, setPrefs] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setResults(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("eventType", eventType);
    formData.append("preferences", JSON.stringify({ style: prefs }));

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Get AI Outfit Recommendations</CardTitle>
          <CardDescription>Upload a photo and let our AI style you for any occasion.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo">Upload Your Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion / Event</Label>
              <select
                id="occasion"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
              >
                <option>Casual</option>
                <option>Party</option>
                <option>Wedding</option>
                <option>Formal</option>
                <option>Date Night</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefs">Style Preferences (Optional)</Label>
              <Input
                id="prefs"
                type="text"
                value={prefs}
                onChange={(e) => setPrefs(e.target.value)}
                placeholder="e.g. I like pastels, avoid sleeveless"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Recommendations"
              )}
            </Button>
          </form>
          {error && <p className="text-red-600 mt-4 text-sm bg-red-50 p-3 rounded">{error}</p>}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <li className="flex flex-col"><span className="font-semibold">Skin Tone</span> {results.analysis.skinTone}</li>
                <li className="flex flex-col"><span className="font-semibold">Age Group</span> {results.analysis.ageGroup}</li>
                <li className="flex flex-col"><span className="font-semibold">Body Shape</span> {results.analysis.bodyShape}</li>
              </ul>
              <div className="mt-4 p-4 bg-white rounded-md border border-blue-100">
                <p className="text-sm text-gray-700 leading-relaxed">{results.analysis.stylingTips}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {results.recommendations.map((rec, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-100">
                   {/* Mock Image since we don't have real product images yet */}
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                     Product Image
                   </div>
                   {rec.product.imageUrl && <img src={rec.product.imageUrl} alt={rec.product.name} className="object-cover w-full h-full" />}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{rec.product.name}</CardTitle>
                  <CardDescription>{rec.reason}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                   <span className="font-bold text-lg">${rec.product.price}</span>
                   <Button size="sm">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
