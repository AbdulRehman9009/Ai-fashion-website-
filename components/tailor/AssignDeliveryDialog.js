"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Truck, MapPin, Star, Package, DollarSign } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function AssignDeliveryDialog({ open, onOpenChange, order, onSuccess }) {
    const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState("");
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (open && order) {
            fetchDeliveryPersonnel();
        }
    }, [open, order]);

    // Reset selection when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedPerson("");
        }
    }, [open]);

    async function fetchDeliveryPersonnel() {
        setLoading(true);
        try {
            // Get customer's city for filtering
            const city = order?.shippingAddress?.city || "";
            const res = await axios.get(`/api/delivery-personnel?available=true${city ? `&city=${city}` : ""}`);
            setDeliveryPersonnel(res.data);

            if (res.data.length === 0) {
                toast.info("No delivery personnel available in this area");
            }
        } catch (error) {
            console.error("Failed to fetch delivery personnel:", error);
            toast.error("Failed to load delivery personnel");
            setDeliveryPersonnel([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleAssign() {
        if (!selectedPerson) {
            toast.error("Please select a delivery person");
            return;
        }

        setAssigning(true);
        try {
            await axios.post("/api/deliveries/assign", {
                orderId: order._id,
                deliveryPersonId: selectedPerson,
                pickupAddress: order.shop?.address || order.shopAddress || {
                    street: "Shop Location",
                    city: order.shippingAddress?.city || "City"
                },
                deliveryAddress: order.shippingAddress
            });

            toast.success("Delivery person assigned successfully!");
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to assign delivery:", error);
            toast.error(error.response?.data?.error || "Failed to assign delivery person");
        } finally {
            setAssigning(false);
        }
    }

    const selectedPersonDetails = deliveryPersonnel.find(p => p._id === selectedPerson);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        Assign Delivery
                    </DialogTitle>
                    <DialogDescription>
                        Select a delivery person for Order #{String(order?._id).slice(-6).toUpperCase()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Delivery Address Summary */}
                    {order?.shippingAddress && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Label className="text-xs text-gray-500 uppercase tracking-wider">Delivery To</Label>
                            <div className="mt-1 flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium">{order.shippingAddress.name}</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {order.shippingAddress.street}, {order.shippingAddress.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                            <span className="ml-2 text-gray-500">Loading delivery personnel...</span>
                        </div>
                    ) : deliveryPersonnel.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No delivery personnel available.</p>
                            <p className="text-sm text-gray-400 mt-1">Try again later or expand the search area.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label className="font-medium">Select Delivery Person</Label>
                                <Select onValueChange={setSelectedPerson} value={selectedPerson}>
                                    <SelectTrigger className="h-auto py-2">
                                        <SelectValue placeholder="Choose a delivery person..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deliveryPersonnel.map(person => (
                                            <SelectItem key={person._id} value={person._id} className="py-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={person.image} />
                                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                                            {person.name?.charAt(0) || "D"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <span className="font-medium">{person.name}</span>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            {person.ratingAvg > 0 && (
                                                                <span className="flex items-center gap-0.5">
                                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                    {person.ratingAvg.toFixed(1)}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-0.5">
                                                                <Package className="h-3 w-3" />
                                                                {person.totalDeliveries} deliveries
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Person Details */}
                            {selectedPersonDetails && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={selectedPersonDetails.image} />
                                            <AvatarFallback className="bg-blue-200 text-blue-800">
                                                {selectedPersonDetails.name?.charAt(0) || "D"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold">{selectedPersonDetails.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                {selectedPersonDetails.ratingAvg > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        {selectedPersonDetails.ratingAvg.toFixed(1)}
                                                        <span className="text-gray-400">({selectedPersonDetails.ratingCount} reviews)</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Truck className="h-4 w-4" />
                                            <span>{selectedPersonDetails.vehicleType}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Package className="h-4 w-4" />
                                            <span>{selectedPersonDetails.totalDeliveries} completed</span>
                                        </div>
                                    </div>

                                    {/* Service Areas */}
                                    {selectedPersonDetails.serviceAreas?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {selectedPersonDetails.serviceAreas.map((area, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {area}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Fee */}
                                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee</span>
                                            <span className="font-bold text-green-600 text-lg">
                                                ${selectedPersonDetails.perDeliveryFee}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleAssign}
                                disabled={assigning || !selectedPerson}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {assigning ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Confirm Delivery Assignment
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
