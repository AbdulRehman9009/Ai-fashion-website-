"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Star, MapPin, Phone, Mail, Scissors, Filter, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Common specializations for filtering
const SPECIALIZATIONS = [
    "Men's Wear",
    "Women's Wear",
    "Kids Wear",
    "Western",
    "Traditional",
    "Bridal",
    "Casual",
    "Formal",
    "Suits",
    "Ethnic Wear"
];

export default function TailorsPage() {
    const [tailors, setTailors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("");
    const [selectedTailor, setSelectedTailor] = useState(null);

    useEffect(() => {
        fetchTailors();
    }, []);

    async function fetchTailors() {
        setLoading(true);
        try {
            const res = await axios.get("/api/tailors");
            setTailors(res.data);
        } catch (error) {
            console.error("Failed to fetch tailors:", error);
            toast.error("Failed to load tailors");
        } finally {
            setLoading(false);
        }
    }

    // Get unique cities from tailors
    const cities = [...new Set(tailors.map(t => t.tailorProfile?.location?.city).filter(Boolean))];

    // Filter tailors based on search and filters
    const filteredTailors = tailors.filter(tailor => {
        const matchesSearch = !searchQuery ||
            tailor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tailor.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCity = !cityFilter ||
            tailor.tailorProfile?.location?.city?.toLowerCase() === cityFilter.toLowerCase();

        const matchesSpec = !specializationFilter ||
            tailor.tailorProfile?.specialization?.some(s =>
                s.toLowerCase().includes(specializationFilter.toLowerCase())
            );

        return matchesSearch && matchesCity && matchesSpec;
    });

    // Sort by rating (highest first)
    const sortedTailors = [...filteredTailors].sort((a, b) =>
        (b.tailorProfile?.ratingAvg || 0) - (a.tailorProfile?.ratingAvg || 0)
    );

    const clearFilters = () => {
        setSearchQuery("");
        setCityFilter("");
        setSpecializationFilter("");
    };

    const hasActiveFilters = searchQuery || cityFilter || specializationFilter;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/shopkeeper" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Scissors className="h-6 w-6 text-purple-600" />
                                    Browse Tailors
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Find and select tailors for your orders
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {sortedTailors.length} tailors available
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Filters Section */}
                <Card className="mb-6 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* City Filter */}
                            <Select value={cityFilter} onValueChange={setCityFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="All Cities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Cities</SelectItem>
                                    {cities.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Specialization Filter */}
                            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="All Specializations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Specializations</SelectItem>
                                    {SPECIALIZATIONS.map(spec => (
                                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                        <p className="text-gray-500">Loading tailors...</p>
                    </div>
                ) : sortedTailors.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Scissors className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Tailors Found</h3>
                        <p className="text-gray-500 mb-4">
                            {hasActiveFilters ? "Try adjusting your filters" : "No tailors are currently registered"}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    /* Tailors Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {sortedTailors.map((tailor, index) => (
                                <motion.div
                                    key={tailor._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className="hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
                                        onClick={() => setSelectedTailor(tailor)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex gap-4">
                                                <Avatar className="h-14 w-14 ring-2 ring-purple-100 dark:ring-purple-900">
                                                    <AvatarImage src={tailor.image} />
                                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-lg">
                                                        {tailor.name?.charAt(0) || "T"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors truncate">
                                                        {tailor.name || "Unnamed Tailor"}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {tailor.tailorProfile?.ratingAvg > 0 ? (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="font-semibold text-sm">{tailor.tailorProfile.ratingAvg.toFixed(1)}</span>
                                                                <span className="text-xs text-gray-500">({tailor.tailorProfile.ratingCount || 0})</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No ratings yet</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {tailor.tailorProfile?.availability && (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 h-fit">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Available
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-3">
                                            {/* Location */}
                                            {tailor.tailorProfile?.location?.city && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span>{tailor.tailorProfile.location.city}</span>
                                                    {tailor.tailorProfile.location.area && (
                                                        <span className="text-gray-400">• {tailor.tailorProfile.location.area}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Specializations */}
                                            {tailor.tailorProfile?.specialization?.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {tailor.tailorProfile.specialization.slice(0, 3).map((spec, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                    {tailor.tailorProfile.specialization.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{tailor.tailorProfile.specialization.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Price */}
                                            {tailor.tailorProfile?.pricePerJob && (
                                                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                    <span className="text-sm text-gray-500">Starting at </span>
                                                    <span className="font-bold text-green-600 text-lg">${tailor.tailorProfile.pricePerJob}</span>
                                                    <span className="text-sm text-gray-500"> /job</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Tailor Details Dialog */}
            <Dialog open={!!selectedTailor} onOpenChange={(o) => !o && setSelectedTailor(null)}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedTailor?.image} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                    {selectedTailor?.name?.charAt(0) || "T"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="text-xl">{selectedTailor?.name}</span>
                                {selectedTailor?.tailorProfile?.availability && (
                                    <Badge className="ml-2 bg-green-100 text-green-700">Available</Badge>
                                )}
                            </div>
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            {selectedTailor?.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Rating */}
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                            <div>
                                <div className="font-bold text-lg">
                                    {selectedTailor?.tailorProfile?.ratingAvg?.toFixed(1) || "0.0"}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Based on {selectedTailor?.tailorProfile?.ratingCount || 0} reviews
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                            <div className="grid gap-2">
                                {selectedTailor?.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="h-4 w-4" />
                                        {selectedTailor.email}
                                    </div>
                                )}
                                {selectedTailor?.tailorProfile?.contact?.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="h-4 w-4" />
                                        {selectedTailor.tailorProfile.contact.phone}
                                    </div>
                                )}
                                {selectedTailor?.tailorProfile?.location?.city && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="h-4 w-4" />
                                        {[
                                            selectedTailor.tailorProfile.location.area,
                                            selectedTailor.tailorProfile.location.city
                                        ].filter(Boolean).join(", ")}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specializations */}
                        {selectedTailor?.tailorProfile?.specialization?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Specializations</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTailor.tailorProfile.specialization.map((spec, i) => (
                                        <Badge key={i} className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing */}
                        {selectedTailor?.tailorProfile?.pricePerJob && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Pricing</h4>
                                <div className="text-2xl font-bold text-green-600">
                                    ${selectedTailor.tailorProfile.pricePerJob}
                                    <span className="text-sm font-normal text-gray-500"> per job</span>
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {selectedTailor?.tailorProfile?.experience && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Experience</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedTailor.tailorProfile.experience} years of experience
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button variant="outline" onClick={() => setSelectedTailor(null)} className="flex-1">
                            Close
                        </Button>
                        <Link href="/dashboard/shopkeeper" className="flex-1">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                <Scissors className="h-4 w-4 mr-2" />
                                Go to Orders
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
