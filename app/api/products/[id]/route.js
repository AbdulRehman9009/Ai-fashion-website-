import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { withErrorHandler } from "@/lib/api-middleware";
import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
async function getProductById(req, { params }) {
    await connectDB();

    const { id } = await params;

    const product = await Product.findById(id)
        .populate('shop', 'name logo location isActive isVisibleToCustomers')
        .lean();

    if (!product) {
        throw new NotFoundError("Product");
    }

    return successResponse(product);
}

export const GET = withErrorHandler(getProductById);
