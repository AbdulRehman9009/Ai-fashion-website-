import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/cart
 * Get user's cart
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: "Unauthorized"
            }, { status: 401 });
        }

        await connectDB();

        let cart = await Cart.findOne({ user: session.user.id })
            .populate({
                path: 'items.product',
                populate: { path: 'shop', select: 'name logo' }
            })
            .lean();

        if (!cart) {
            cart = { items: [] };
        }

        return NextResponse.json({
            success: true,
            data: cart.items || [],
            count: cart.items?.length || 0
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return NextResponse.json(
            { error: "Failed to fetch cart" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/cart
 * Add product to cart
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: "Unauthorized"
            }, { status: 401 });
        }

        const { productId, quantity = 1, selectedOptions = {} } = await req.json();

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: session.user.id,
                items: [{ product: productId, quantity, selectedOptions }]
            });
        } else {
            // Check if product already in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId &&
                    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            );

            if (existingItemIndex > -1) {
                // Update quantity
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ product: productId, quantity, selectedOptions });
            }

            await cart.save();
        }

        return NextResponse.json({
            success: true,
            message: "Product added to cart",
            count: cart.items.length
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return NextResponse.json(
            { error: "Failed to add to cart" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/cart
 * Remove product from cart
 */
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: "Unauthorized"
            }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const itemIndex = searchParams.get("itemIndex");

        if (!productId && itemIndex === null) {
            return NextResponse.json(
                { error: "Product ID or item index is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            return NextResponse.json(
                { error: "Cart not found" },
                { status: 404 }
            );
        }

        if (itemIndex !== null) {
            cart.items.splice(parseInt(itemIndex), 1);
        } else {
            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        }

        await cart.save();

        return NextResponse.json({
            success: true,
            message: "Product removed from cart",
            count: cart.items.length
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        return NextResponse.json(
            { error: "Failed to remove from cart" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/cart
 * Update cart item quantity
 */
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: "Unauthorized"
            }, { status: 401 });
        }

        const { itemIndex, quantity } = await req.json();

        if (itemIndex === undefined || !quantity || quantity < 1) {
            return NextResponse.json(
                { error: "Valid item index and quantity are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const cart = await Cart.findOne({ user: session.user.id });

        if (!cart || !cart.items[itemIndex]) {
            return NextResponse.json(
                { error: "Cart or item not found" },
                { status: 404 }
            );
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return NextResponse.json({
            success: true,
            message: "Cart updated",
            count: cart.items.length
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json(
            { error: "Failed to update cart" },
            { status: 500 }
        );
    }
}
