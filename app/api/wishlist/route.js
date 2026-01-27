import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/wishlist
 * Get user's wishlist
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

        let wishlist = await Wishlist.findOne({ user: session.user.id })
            .populate({
                path: 'products.product',
                populate: { path: 'shop', select: 'name logo' }
            })
            .lean();

        if (!wishlist) {
            wishlist = { products: [] };
        }

        return NextResponse.json({
            success: true,
            data: wishlist.products || []
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch wishlist"
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/wishlist
 * Add product to wishlist
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                error: "Unauthorized"
            }, { status: 401 });
        }

        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json(
                {
                    error: "Product ID is required"
                },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                {
                    error: "Product not found"
                },
                { status: 404 }
            );
        }

        // Find or create wishlist
        let wishlist = await Wishlist.findOne({ user: session.user.id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: session.user.id,
                products: [{ product: productId }]
            });
        } else {
            // Check if product already in wishlist
            const exists = wishlist.products.some(
                item => item.product.toString() === productId
            );

            if (exists) {
                return NextResponse.json(
                    {
                        error: "Product already in wishlist"
                    },
                    { status: 400 }
                );
            }

            wishlist.products.push({ product: productId });
            await wishlist.save();
        }

        return NextResponse.json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return NextResponse.json(
            {
                error: "Failed to add to wishlist"
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/wishlist
 * Remove product from wishlist
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

        if (!productId) {
            return NextResponse.json(
                {
                    error: "Product ID is required"
                },
                { status: 400 }
            );
        }

        await connectDB();

        const wishlist = await Wishlist.findOne({ user: session.user.id });

        if (!wishlist) {
            return NextResponse.json(
                {
                    error: "Wishlist not found"
                },
                { status: 404 }
            );
        }

        wishlist.products = wishlist.products.filter(
            item => item.product.toString() !== productId
        );

        await wishlist.save();

        return NextResponse.json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return NextResponse.json(
            {
                error: "Failed to remove from wishlist"
            },
            { status: 500 }
        );
    }
}
