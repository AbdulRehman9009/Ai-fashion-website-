import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

/**
 * POST /api/cart
 * Add product to cart or update quantity
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { productId, quantity = 1, selectedOptions = {} } = await req.json();

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: session.user.id });

        // If cart doesn't exist, create new one
        if (!cart) {
            cart = await Cart.create({
                user: session.user.id,
                items: [{ product: productId, quantity, selectedOptions }]
            });
            await cart.populate({ path: 'items.product', select: 'shop' });
            return NextResponse.json(cart);
        }

        // Cart exists but is empty
        if (!cart.items || cart.items.length === 0) {
            cart.items = [{ product: productId, quantity, selectedOptions }];
            await cart.save();
            return NextResponse.json({
                success: true,
                message: "Product added to cart",
                count: cart.items.length
            });
        }

        // Cart has items - check multi-shop constraint
        await Cart.populate(cart, { path: 'items.product', select: 'shop' });

        const existingShopId = cart.items[0].product?.shop?.toString();
        const newProductShopId = product.shop?.toString();

        if (existingShopId && newProductShopId && existingShopId !== newProductShopId) {
            return NextResponse.json(
                {
                    error: "Multi-shop orders are not allowed",
                    code: "MULTI_SHOP_ERROR",
                    existingShop: existingShopId,
                    newShop: newProductShopId
                },
                { status: 400 }
            );
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product._id.toString() === productId &&
                JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Re-fetch clean cart to avoid save errors with populated fields
            cart = await Cart.findOne({ user: session.user.id });

            // Re-check index on clean cart
            const cleanIndex = cart.items.findIndex(
                item => item.product.toString() === productId &&
                    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            );

            if (cleanIndex > -1) {
                cart.items[cleanIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity, selectedOptions });
            }
        }

        await cart.save();

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
