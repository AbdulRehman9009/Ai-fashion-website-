"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Scissors, Search, MapPin, Briefcase, Star, CheckCircle, XCircle,
    Loader2, Award
} from "lucide-react";
import { toast } from "react-toastify";

export default function TailorManagementPage() {
    const [tailors, setTailors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState({});

    useEffect(() => {
        fetchTailors();
    }, []);

    const fetchTailors = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/tailors");
            if (res.ok) {
                const data = await res.json();
                setTailors(data);
            } else {
                toast.error("Failed to load tailors");
            }
        } catch (error) {
            console.error("Error fetching tailors:", error);
            toast.error("Could not load tailors");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async (tailorId, currentValue) => {
        setUpdating(prev => ({ ...prev, [tailorId]: true }));

        try {
            const res = await fetch("/api/admin/tailors", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tailorId,
                    availability: !currentValue
                })
            });

            if (res.ok) {
                toast.success(`Tailor ${!currentValue ? "enabled" : "disabled"} for orders`);
                fetchTailors();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [tailorId]: false }));
        }
    };

    const filteredTailors = tailors.filter(tailor =>
        tailor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tailor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tailor.tailorProfile?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TailorCard = ({ tailor }) => {
        const isUpdating = updating[tailor._id];
        const profile = tailor.tailorProfile || {};
        const location = profile.location || {};
        const isAvailable = profile.availability !== false;

        return (
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="flex gap-6">
                        {/* Tailor Avatar */}
                        <div className="flex-shrink-0">
                            {tailor.image ? (
                                <img
                                    src={tailor.image}
                                    alt={tailor.name}
                                    className="h-20 w-20 object-cover rounded-full border-2 border-purple-200"
                                />
                            ) : (
                                <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Scissors className="h-10 w-10 text-purple-600" />
                                </div>
                            )}
                        </div>

                        {/* Tailor Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold">{tailor.name || "No Name"}</h3>
                                        {isAvailable ? (
                                            <Badge className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Available
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-gray-100">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Unavailable
                                            </Badge>
                                        )}
                                        {tailor.status === "SUSPENDED" && (
                                            <Badge variant="destructive">Suspended</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{tailor.email}</p>

                                    {/* Location */}
                                    {location.city && (
                                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-purple-500" />
                                            {location.address && `${location.address}, `}
                                            {location.city}
                                            {location.state && `, ${location.state}`}
                                        </p>
                                    )}

                                    {/* Specialization */}
                                    {profile.specialization && profile.specialization.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {profile.specialization.map((spec, idx) => (
                                                <Badge key={idx} variant="outline" className="bg-purple-50">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Experience</p>
                                        <p className="text-lg font-semibold">
                                            {profile.experience || 0} {profile.experience === 1 ? "year" : "years"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Orders Completed</p>
                                        <p className="text-lg font-semibold">{tailor.orderCount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Rating</p>
                                        <p className="text-lg font-semibold">
                                            {profile.ratingAvg ? profile.ratingAvg.toFixed(1) : "N/A"}
                                            {profile.ratingCount > 0 && (
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({profile.ratingCount})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Availability Control */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                                <Switch
                                    checked={isAvailable}
                                    onCheckedChange={() => handleToggleAvailability(tailor._id, isAvailable)}
                                    disabled={isUpdating || tailor.status === "SUSPENDED"}
                                />
                                <div>
                                    <Label className="text-sm font-medium">Available for Orders</Label>
                                    <p className="text-xs text-gray-500">
                                        {isAvailable
                                            ? "Shopkeepers can assign orders to this tailor"
                                            : "This tailor is not accepting new orders"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const availableTailors = tailors.filter(t => t.tailorProfile?.availability !== false && t.status === "ACTIVE");
    const unavailableTailors = tailors.filter(t => t.tailorProfile?.availability === false || t.status === "SUSPENDED");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                    <Scissors className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tailor Management</h2>
                    <p className="text-gray-500">Manage tailor availability and monitor performance</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-700">Total Tailors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tailors.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-700">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableTailors.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-700">Unavailable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unavailableTailors.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {tailors.reduce((sum, t) => sum + (t.orderCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Box */}
            <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6">
                    <div className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-purple-900">Tailor Visibility Fixed</h4>
                            <p className="text-sm text-purple-700 mt-1">
                                Shopkeepers can now browse and select available tailors from the{" "}
                                <code className="bg-purple-100 px-1 py-0.5 rounded">/api/tailors</code> endpoint.
                                Toggle "Available for Orders" to control which tailors appear in shopkeeper searches.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search tailors by name, email, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tailors List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            ) : filteredTailors.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        No tailors found
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTailors.map(tailor => (
                        <TailorCard key={tailor._id} tailor={tailor} />
                    ))}
                </div>
            )}
        </div>
    );
}
