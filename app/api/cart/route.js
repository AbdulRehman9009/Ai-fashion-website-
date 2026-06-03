import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Validate that productId is a valid ObjectId to avoid DB errors */
function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function requireCustomerCart(session) {
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "USER") {
        return NextResponse.json({ error: "Only customer accounts can use the cart" }, { status: 403 });
    }
    return null;
}

/** Return the shop ID for a product efficiently */
async function getProductShopId(productId) {
    const p = await Product.findById(productId).select("shop stock isActive").lean();
    return p;
}

async function getPopulatedCartResponse(userId, message) {
    const cart = await Cart.findOne({ user: userId })
        .select("items shop")
        .populate({
            path: "items.product",
            select: "title images basePrice price stock shop isActive",
            populate: { path: "shop", select: "name logo" }
        })
        .lean();

    const items = cart?.items || [];

    return NextResponse.json({
        success: true,
        message,
        data: items,
        count: items.length,
        shop: cart?.shop || null
    });
}

// ─── GET /api/cart ───────────────────────────────────────────────────────────

/**
 * GET /api/cart
 * Returns the user's cart with populated product details.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const authError = requireCustomerCart(session);
        if (authError) return authError;

        await connectDB();

        const cart = await Cart.findOne({ user: session.user.id })
            .select("items shop")
            .populate({
                path: "items.product",
                select: "title images basePrice price stock shop isActive",
                populate: { path: "shop", select: "name logo" }
            })
            .lean();

        const items = cart?.items || [];

        return NextResponse.json({
            success: true,
            data: items,
            count: items.length,
            shop: cart?.shop || null
        });
    } catch (error) {
        console.error("[GET /api/cart]", error);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}

// ─── POST /api/cart ──────────────────────────────────────────────────────────

/**
 * POST /api/cart
 * Add a product to the cart or increment quantity if it already exists.
 * Validates stock and enforces single-shop cart constraint.
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const authError = requireCustomerCart(session);
        if (authError) return authError;

        const body = await req.json();
        const { productId, quantity = 1, selectedOptions = {} } = body;

        if (!productId || !isValidId(productId)) {
            return NextResponse.json({ error: "Valid product ID is required" }, { status: 400 });
        }
        if (quantity < 1 || quantity > 100) {
            return NextResponse.json({ error: "Quantity must be between 1 and 100" }, { status: 400 });
        }

        await connectDB();

        // Validate product and check stock in a single lean query
        const product = await getProductShopId(productId);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        if (product.isActive === false) {
            return NextResponse.json({ error: "This product is no longer available" }, { status: 400 });
        }
        if (product.stock !== undefined && product.stock < quantity) {
            return NextResponse.json({
                error: `Only ${product.stock} items available in stock`,
                code: "INSUFFICIENT_STOCK",
                available: product.stock
            }, { status: 400 });
        }

        const newShopId = product.shop?.toString();

        // Atomically find existing cart
        const existingCart = await Cart.findOne({ user: session.user.id })
            .select("shop items.product items.selectedOptions items.quantity")
            .lean();

        if (existingCart) {
            // Multi-shop constraint check
            const cartShopId = existingCart.shop?.toString();
            if (cartShopId && newShopId && cartShopId !== newShopId) {
                return NextResponse.json({
                    error: "Your cart contains items from a different shop. Clear your cart to add this item.",
                    code: "MULTI_SHOP_ERROR",
                    existingShop: cartShopId,
                    newShop: newShopId
                }, { status: 400 });
            }

            // Check if the exact same product+options combo exists
            const existingItem = existingCart.items.find(
                (item) =>
                    item.product.toString() === productId &&
                    JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions)
            );

            if (existingItem) {
                // Increment quantity atomically using positional $ operator
                const updated = await Cart.findOneAndUpdate(
                    {
                        user: session.user.id,
                        "items.product": new mongoose.Types.ObjectId(productId),
                        "items.selectedOptions": existingItem.selectedOptions
                    },
                    { $inc: { "items.$.quantity": quantity } },
                    { new: true }
                );
                return await getPopulatedCartResponse(session.user.id, "Cart updated");
            } else {
                // Push new item and set shop atomically
                const updated = await Cart.findOneAndUpdate(
                    { user: session.user.id },
                    {
                        $push: { items: { product: productId, quantity, selectedOptions } },
                        $set: { shop: product.shop }
                    },
                    { new: true }
                );
                return await getPopulatedCartResponse(session.user.id, "Product added to cart");
            }
        } else {
            // Create new cart
            const newCart = await Cart.create({
                user: session.user.id,
                shop: product.shop,
                items: [{ product: productId, quantity, selectedOptions }]
            });
            return await getPopulatedCartResponse(session.user.id, "Product added to cart");
        }
    } catch (error) {
        console.error("[POST /api/cart]", error);
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
    }
}

// ─── PATCH /api/cart ─────────────────────────────────────────────────────────

/**
 * PATCH /api/cart
 * Update quantity for a specific cart item by productId + selectedOptions.
 * Uses atomic update — no fetch-then-save pattern.
 */
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        const authError = requireCustomerCart(session);
        if (authError) return authError;

        const { productId, selectedOptions = {}, quantity } = await req.json();

        if (!productId || !isValidId(productId)) {
            return NextResponse.json({ error: "Valid product ID is required" }, { status: 400 });
        }
        if (!quantity || quantity < 1) {
            return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
        }

        await connectDB();

        // Validate stock before update
        const product = await Product.findById(productId).select("stock").lean();
        if (product?.stock !== undefined && product.stock < quantity) {
            return NextResponse.json({
                error: `Only ${product.stock} items available in stock`,
                code: "INSUFFICIENT_STOCK",
                available: product.stock
            }, { status: 400 });
        }

        // Atomic update using arrayFilters
        const updated = await Cart.findOneAndUpdate(
            { user: session.user.id },
            { $set: { "items.$[elem].quantity": quantity } },
            {
                arrayFilters: [
                    {
                        "elem.product": new mongoose.Types.ObjectId(productId),
                        "elem.selectedOptions": selectedOptions
                    }
                ],
                new: true
            }
        );

        if (!updated) {
            return NextResponse.json({ error: "Cart or item not found" }, { status: 404 });
        }

        return await getPopulatedCartResponse(session.user.id, "Cart updated");
    } catch (error) {
        console.error("[PATCH /api/cart]", error);
        return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
    }
}

// ─── DELETE /api/cart ────────────────────────────────────────────────────────

/**
 * DELETE /api/cart
 * - ?clear=true   → clear all items from cart (atomic)
 * - ?productId=X  → remove specific product (atomic $pull)
 */
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        const authError = requireCustomerCart(session);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const clearCart = searchParams.get("clear") === "true" || searchParams.get("action") === "clear";
        const productId = searchParams.get("productId");
        const selectedOptionsRaw = searchParams.get("selectedOptions");

        await connectDB();

        if (clearCart) {
            // Atomic clear — also reset the shop field
            const cart = await Cart.findOneAndUpdate(
                { user: session.user.id },
                { $set: { items: [], shop: null } },
                { new: true }
            );
            return await getPopulatedCartResponse(session.user.id, "Cart cleared");
        }

        if (!productId || !isValidId(productId)) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Parse selectedOptions if provided
        let selectedOptions = {};
        if (selectedOptionsRaw) {
            try { selectedOptions = JSON.parse(selectedOptionsRaw); } catch {}
        }

        // Atomic $pull — removes the matched item
        const pullFilter = { product: new mongoose.Types.ObjectId(productId) };
        if (Object.keys(selectedOptions).length > 0) {
            pullFilter.selectedOptions = selectedOptions;
        }

        const updated = await Cart.findOneAndUpdate(
            { user: session.user.id },
            { $pull: { items: pullFilter } },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

        // Clear shop field if cart is now empty
        if (updated.items.length === 0) {
            await Cart.updateOne({ user: session.user.id }, { $set: { shop: null } });
        }

        return await getPopulatedCartResponse(session.user.id, "Product removed from cart");
    } catch (error) {
        console.error("[DELETE /api/cart]", error);
        return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
    }
}
