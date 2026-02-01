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

        // If cart doesn't exist at all, create it with the item
        if (!cart) {
            cart = await Cart.create({
                user: session.user.id,
                items: [{ product: productId, quantity, selectedOptions }]
            });
            await cart.populate({ path: 'items.product', select: 'shop' }); // Populate to return consistent structure
        } else if (!cart.items || cart.items.length === 0) {
            // Cart exists but is empty - just add the item directly
            // No need to check shop conflict for first item
            cart.items = [{ product: productId, quantity, selectedOptions }];
            await cart.save();
            return NextResponse.json({
                success: true,
                message: "Product added to cart",
                count: cart.items.length
            });
            // We need to populate ensuring structure match for later return
            // But since we just pushed an ID, we might need to verify the product fetch first?
            // Actually, downstream code expects populated items. 
            // It's safer to save and then re-populate or manually push and continue.
            // Let's just fall through to the "else" logic? No, else logic does conflict check.

            // Optimization: Just ensure it's treated as a valid cart for subsequent logic
            // But we need to save it if we return early? 
            // Actually, let's just push the item here and let the function finish saving at the end.
            // Wait, the original code had a separate block for creation.

            // Let's restart this logic block to be cleaner:
        } else {
            // Check existing items' shop
            // We need to fetch the shop of the first item in the cart to compare
            // Since cart.items stores product IDs, we need to populate or fetch the product of the first item
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
            // Note: items are now populated, so we compare product._id
            const existingItemIndex = cart.items.findIndex(
                item => item.product._id.toString() === productId &&
                    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            );

            if (existingItemIndex > -1) {
                // Update quantity
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                // We must push the structure expected by Mongoose (just the ID for the ref)
                // But since we populated 'items.product', the array is technically mixed now if not careful.
                // Safest is to re-fetch or just push objects. Mongoose allows pushing objects with _id.
                // However, we populated existing items. 
                // Let's depopulate or just save the new item as a clean object

                // Re-fetching clean cart to avoid save errors with populated fields
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
        const clearCart = searchParams.get("clear") === "true" || searchParams.get("action") === "clear";

        // If clearing cart, skip validation for productId/itemIndex
        if (!clearCart && !productId && itemIndex === null) {
            return NextResponse.json(
                { error: "Product ID or item index is required" },
                { status: 400 }
            );
        }

        await connectDB();

        if (clearCart) {
            // Atomic operation to clear cart
            const cart = await Cart.findOneAndUpdate(
                { user: session.user.id },
                { $set: { items: [] } },
                { new: true }
            );

            if (!cart) {
                return NextResponse.json(
                    { error: "Cart not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Cart cleared",
                count: 0
            });
        }

        // Handle single item removal
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
