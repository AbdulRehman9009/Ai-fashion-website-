import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Shop from "@/models/Shop";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPaddleProduct, updatePaddleProduct, archivePaddleProduct } from "@/lib/paddle/paddleClient";
import { withErrorHandler, withAuth } from "@/lib/api-middleware";
import { successResponse, createdResponse, paginatedResponse, noContentResponse } from "@/lib/api-response";
import { NotFoundError, AuthorizationError, ValidationError } from "@/lib/errors";
import { validate, createProductSchema, updateProductSchema, productQuerySchema } from "@/lib/validation/schemas";
import { sanitizeObject } from "@/lib/security";
import { logger } from "@/lib/logger";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/audit-logger";

/**
 * GET /api/products
 * List products with filtering, pagination, and sorting
 * 
 * @query {string} role - Filter by user role (SHOPKEEPER gets their products only)
 * @query {string} shop - Filter by shop ID
 * @query {string} category - Filter by category
 * @query {number} minPrice - Minimum price
 * @query {number} maxPrice - Maximum price
 * @query {string} type - Product type (STITCHED, UNSTITCHED, READY_TO_WEAR)
 * @query {string} search - Search in title/description/tags
 * @query {number} page - Page number
 * @query {number} limit - Items per page
 * @query {string} sort - Sort order (price_asc, price_desc, newest, oldest)
 */
async function getProducts(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  // If Shopkeeper, return their products only
  if (role === "SHOPKEEPER") {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOPKEEPER") {
      throw new AuthorizationError("Unauthorized access");
    }

    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) {
      return paginatedResponse([], { page: 1, limit: 20, total: 0 });
    }

    const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 }).lean();
    return paginatedResponse(products, { page: 1, limit: products.length, total: products.length });
  }

  // Validate query parameters
  const queryValidation = validate(productQuerySchema, {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    category: searchParams.get('category'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    audience: searchParams.get('audience'),
    type: searchParams.get('type'),
    search: searchParams.get('search'),
    sort: searchParams.get('sort')
  });

  if (!queryValidation.success) {
    throw new ValidationError("Invalid query parameters", queryValidation.errors);
  }

  const { page, limit, category, minPrice, maxPrice, audience, type, search, sort } = queryValidation.data;
  const skip = (page - 1) * limit;

  // Build query
  const includeAll = searchParams.get('includeAll') === 'true';
  const query = includeAll
    ? {}
    : {
      isActive: true,
      "images.0": { $exists: true, $nin: ["", null] }
    };
  const shopId = searchParams.get("shop");
  if (shopId) query.shop = shopId;
  if (category) query.category = category;
  if (audience) query.audience = audience;
  if (type) query.type = type;
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.basePrice = {};
    if (minPrice !== undefined) query.basePrice.$gte = minPrice;
    if (maxPrice !== undefined) query.basePrice.$lte = maxPrice;
  }
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  let sortOption = {};
  switch (sort) {
    case 'price_asc':
      sortOption = { basePrice: 1 };
      break;
    case 'price_desc':
      sortOption = { basePrice: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('shop', 'name logo location isActive isVisibleToCustomers')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  // Filter out products from inactive or hidden shops (unless includeAll)
  const visibleProducts = includeAll
    ? products
    : products.filter(p => {
      // If shop is populated and has visibility flags, check them
      if (p.shop) {
        return p.shop.isActive && p.shop.isVisibleToCustomers;
      }
      // If no shop info, include the product (edge case)
      return true;
    });

  return paginatedResponse(visibleProducts, { page, limit, total: visibleProducts.length });
}

/**
 * POST /api/products
 * Create a new product (Shopkeeper only)
 */
async function createProduct(req) {
  await connectDB();

  // Parse and sanitize request body
  const body = await req.json();
  const sanitized = sanitizeObject(body);

  // Validate input
  const validation = validate(createProductSchema, sanitized);
  if (!validation.success) {
    throw new ValidationError("Invalid product data", validation.errors);
  }

  const productData = validation.data;

  // Get shopkeeper's shop
  const shop = await Shop.findOne({ owner: req.user.id });
  if (!shop) {
    throw new NotFoundError("Shop not found for this user");
  }

  try {
    // Create Product in DB first
    const product = await Product.create({ ...productData, shop: shop._id });

    // Sync with Paddle
    try {
      const paddleResult = await createPaddleProduct({
        name: product.title,
        description: product.description,
        price: product.basePrice,
        currency: "USD",
        category: product.category,
        imageUrl: product.images?.[0]
      });

      if (paddleResult.success) {
        product.paddleProductId = paddleResult.productId;
        product.paddlePriceId = paddleResult.priceId;
        product.paddleSyncStatus = "synced";
      } else {
        product.paddleSyncStatus = "failed";
        product.paddleSyncError = paddleResult.error;
        logger.error("Paddle sync failed", { productId: product._id, error: paddleResult.error });
      }
      await product.save();
    } catch (syncError) {
      logger.error("Paddle sync error", { productId: product._id, error: syncError.message });
      product.paddleSyncStatus = "failed";
      product.paddleSyncError = syncError.message;
      await product.save();
    }

    // Create audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      userId: req.user.id,
      resource: 'Product',
      resourceId: product._id.toString(),
      metadata: { title: product.title, category: product.category, price: product.basePrice }
    }, req);

    logger.info("Product created", {
      productId: product._id.toString(),
      shopId: shop._id.toString(),
      userId: req.user.id
    });

    return createdResponse(product, "Product created successfully");
  } catch (error) {
    logger.error("Product creation failed", { error: error.message, userId: req.user.id });
    throw error;
  }
}

/**
 * PUT /api/products
 * Update a product (Shopkeeper only)
 */
async function updateProduct(req) {
  await connectDB();

  const body = await req.json();
  const sanitized = sanitizeObject(body);

  // Validate input
  const validation = validate(updateProductSchema, sanitized);
  if (!validation.success) {
    throw new ValidationError("Invalid product data", validation.errors);
  }

  const { _id, ...updates } = validation.data;

  const product = await Product.findById(_id);
  if (!product) {
    throw new NotFoundError("Product");
  }

  const shop = await Shop.findById(product.shop);
  if (!shop || shop.owner.toString() !== req.user.id) {
    throw new AuthorizationError("You can only update your own products");
  }

  try {
    // Update DB
    const updated = await Product.findByIdAndUpdate(_id, updates, { new: true });

    // Sync with Paddle (if critical fields changed)
    if (updates.title || updates.basePrice || updates.description) {
      try {
        const paddleResult = await updatePaddleProduct(updated.paddleProductId, updated.paddlePriceId, {
          name: updated.title,
          price: updated.basePrice,
          currency: "USD",
          description: updated.description,
          imageUrl: updated.images?.[0]
        });

        if (paddleResult.success) {
          updated.paddlePriceId = paddleResult.priceId || updated.paddlePriceId;
          updated.paddleSyncStatus = "synced";
          updated.paddleSyncError = null;
        } else {
          updated.paddleSyncStatus = "failed";
          updated.paddleSyncError = paddleResult.error;
        }
        await updated.save();
      } catch (syncError) {
        logger.error("Paddle update error", { productId: _id, error: syncError.message });
      }
    }

    // Create audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      userId: req.user.id,
      resource: 'Product',
      resourceId: _id,
      metadata: { updates: Object.keys(updates) }
    }, req);

    logger.info("Product updated", { productId: _id, userId: req.user.id });

    return successResponse(updated, "Product updated successfully");
  } catch (error) {
    logger.error("Product update failed", { productId: _id, error: error.message });
    throw error;
  }
}

/**
 * DELETE /api/products
 * Delete a product (Shopkeeper only)
 */
async function deleteProduct(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    throw new ValidationError("Product ID is required");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError("Product");
  }

  const shop = await Shop.findById(product.shop);
  if (!shop || shop.owner.toString() !== req.user.id) {
    throw new AuthorizationError("You can only delete your own products");
  }

  try {
    // Archive in Paddle
    if (product.paddleProductId) {
      await archivePaddleProduct(product.paddleProductId);
    }
  } catch (error) {
    logger.error("Paddle archive error", { productId: id, error: error.message });
    // Proceed with deletion anyway
  }

  await Product.findByIdAndDelete(id);

  // Create audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.PRODUCT_DELETED,
    userId: req.user.id,
    resource: 'Product',
    resourceId: id,
    metadata: { title: product.title }
  }, req);

  logger.info("Product deleted", { productId: id, userId: req.user.id });

  return noContentResponse();
}

// Export with middleware
export const GET = withErrorHandler(getProducts);
export const POST = withErrorHandler(withAuth(createProduct, { roles: ['SHOPKEEPER'] }));
export const PUT = withErrorHandler(withAuth(updateProduct, { roles: ['SHOPKEEPER'] }));
export const DELETE = withErrorHandler(withAuth(deleteProduct, { roles: ['SHOPKEEPER'] }));
