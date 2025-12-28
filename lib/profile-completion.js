import User from "@/models/User";
import Shop from "@/models/Shop";
import Profile from "@/models/Profile";

/**
 * Role-specific required fields (Paddle-compatible, no Stripe)
 */
const REQUIRED_FIELDS = {
    USER: {
        basic: ["name", "email"],
        profile: ["phone"],
        address: ["addresses.0.street", "addresses.0.city", "addresses.0.state"],
    },
    TAILOR: {
        basic: ["name", "email"],
        profile: ["tailorProfile.phone", "tailorProfile.cnicId", "tailorProfile.experience"],
        location: ["tailorProfile.location.address", "tailorProfile.location.city"],
        specialization: ["tailorProfile.specialization"],
        pricing: [], // Either pricePerJob OR commissionPercentage (checked separately)
        payout: ["payoutMethod.bankDetails.accountNumber"], // Require bank details
        terms: ["tailorProfile.agreedToTerms"],
    },
    SHOPKEEPER: {
        basic: ["name", "email"],
        shop: ["businessDetails.ownerName", "businessDetails.phone"],
        location: ["location.address", "location.city"],
        payout: ["payoutMethod.bankDetails.accountNumber"], // Require bank details
        terms: ["commissionAgreement.agreedToTerms"],
    },
    DELIVERY: {
        basic: ["name", "email"],
        profile: [
            "deliveryProfile.fullName",
            "deliveryProfile.phone",
            "deliveryProfile.cnicId",
            "deliveryProfile.vehicleType",
            "deliveryProfile.licenseNumber",
        ],
        service: ["deliveryProfile.serviceAreas"],
        payout: ["payoutMethod.bankDetails.accountNumber"], // Require bank details
        terms: ["deliveryProfile.agreedToTerms"],
    },
    ADMIN: {
        basic: ["name", "email"],
    },
};

/**
 * Get nested property value
 */
function getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
        if (current && typeof current === "object") {
            if (!isNaN(key)) {
                return current[parseInt(key)];
            }
            return current[key];
        }
        return undefined;
    }, obj);
}

/**
 * Check if a field is complete
 */
function isFieldComplete(value) {
    if (value === null || value === undefined || value === "") {
        return false;
    }
    if (Array.isArray(value) && value.length === 0) {
        return false;
    }
    return true;
}

/**
 * Check profile completion for a user (Paddle-compatible)
 */
export async function checkProfileCompletion(userId, role) {
    try {
        const { connectDB } = await import("./db");
        await connectDB();

        const user = await User.findById(userId).lean();
        if (!user) {
            return {
                isComplete: false,
                percentage: 0,
                missingFields: [],
                error: "User not found",
            };
        }

        let allRequiredFields = [];
        let missingFields = [];
        let dataSource = user;

        // For shopkeeper, also check Shop model
        if (role === "SHOPKEEPER") {
            const shop = await Shop.findOne({ owner: userId }).lean();
            if (shop) {
                dataSource = { ...user, ...shop };
            }
        }

        // For customers, also check Profile model
        if (role === "USER") {
            const profile = await Profile.findOne({ user: userId }).lean();
            if (profile) {
                dataSource = { ...user, ...profile };
            }
        }

        // Collect all required fields for role
        const roleFields = REQUIRED_FIELDS[role] || {};
        for (const category in roleFields) {
            allRequiredFields = allRequiredFields.concat(roleFields[category]);
        }

        // Special handling for TAILOR pricing (either/or)
        if (role === "TAILOR") {
            const hasPricePerJob = isFieldComplete(user.tailorProfile?.pricePerJob);
            const hasCommission = isFieldComplete(user.tailorProfile?.commissionPercentage);
            if (!hasPricePerJob && !hasCommission) {
                missingFields.push("tailorProfile.pricePerJob or tailorProfile.commissionPercentage");
            }
        }

        // Check each required field
        for (const fieldPath of allRequiredFields) {
            const value = getNestedValue(dataSource, fieldPath);
            if (!isFieldComplete(value)) {
                missingFields.push(fieldPath);
            }
        }

        // For vendor roles, verify bank details are set (not Stripe account)
        if (["TAILOR", "SHOPKEEPER", "DELIVERY"].includes(role)) {
            if (!user.payoutMethod?.bankDetails?.accountNumber) {
                if (!missingFields.includes("payoutMethod.bankDetails.accountNumber")) {
                    missingFields.push("payoutMethod.bankDetails.accountNumber");
                }
            }
        }

        const totalFields = allRequiredFields.length + (role === "TAILOR" ? 1 : 0);
        const completedFields = totalFields - missingFields.length;
        const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        const isComplete = missingFields.length === 0;

        return {
            isComplete,
            percentage,
            missingFields,
            totalFields,
            completedFields,
        };
    } catch (error) {
        console.error("Error checking profile completion:", error);
        return {
            isComplete: false,
            percentage: 0,
            missingFields: [],
            error: error.message,
        };
    }
}

/**
 * Update profile completion status
 */
export async function updateProfileCompletionStatus(userId, role) {
    try {
        const status = await checkProfileCompletion(userId, role);

        await User.findByIdAndUpdate(userId, {
            "profileCompletion.isComplete": status.isComplete,
            "profileCompletion.percentage": status.percentage,
            "profileCompletion.missingFields": status.missingFields,
        });

        return status;
    } catch (error) {
        console.error("Error updating profile completion:", error);
        return { error: error.message };
    }
}

/**
 * Get human-readable field labels
 */
export function getFieldLabel(fieldPath) {
    const labels = {
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        "tailorProfile.phone": "Phone Number",
        "tailorProfile.cnicId": "CNIC/ID Number",
        "tailorProfile.experience": "Years of Experience",
        "tailorProfile.location.address": "Business Address",
        "tailorProfile.location.city": "City",
        "tailorProfile.specialization": "Specializations",
        "tailorProfile.pricePerJob": "Price Per Job",
        "tailorProfile.commissionPercentage": "Commission Percentage",
        "tailorProfile.agreedToTerms": "Terms Agreement",
        "businessDetails.ownerName": "Owner Name",
        "businessDetails.phone": "Business Phone",
        "location.address": "Business Address",
        "location.city": "City",
        "commissionAgreement.agreedToTerms": "Commission Agreement",
        "deliveryProfile.fullName": "Full Name",
        "deliveryProfile.phone": "Phone Number",
        "deliveryProfile.cnicId": "CNIC/ID Number",
        "deliveryProfile.vehicleType": "Vehicle Type",
        "deliveryProfile.licenseNumber": "License Number",
        "deliveryProfile.serviceAreas": "Service Areas",
        "deliveryProfile.agreedToTerms": "Terms Agreement",
        "addresses.0.street": "Street Address",
        "addresses.0.city": "City",
        "addresses.0.state": "State",
        "payoutMethod.bankDetails.accountNumber": "Bank Account Number",
    };

    return labels[fieldPath] || fieldPath;
}
