/**
 * Script to add test Paddle price IDs to products for development
 * This enables card payment testing with Paddle sandbox
 * 
 * IMPORTANT: These are sample Paddle sandbox price IDs. 
 * In production, you need to create actual products in your Paddle dashboard
 * and use those price IDs.
 * 
 * Usage: node scripts/addPaddlePrices.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Product schema inline for script
const ProductSchema = new mongoose.Schema({
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    title: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, required: true },
    tags: [String],
    basePrice: { type: Number, required: true },
    images: [String],
    stock: { type: Number, default: 0 },
    type: { type: String, enum: ["STITCHED", "UNSTITCHED", "READY_TO_WEAR"], default: "READY_TO_WEAR" },
    attributes: {
        color: String,
        fabric: String,
        pattern: String,
    },
    paddleProductId: String,
    paddlePriceId: String,
    paddleSyncStatus: {
        type: String,
        enum: ["pending", "synced", "failed"],
        default: "pending",
    },
    paddleSyncError: String,
}, { timestamps: true });

/**
 * SAMPLE PADDLE SANDBOX PRICE IDs
 * Replace these with your actual Paddle sandbox price IDs from:
 * https://sandbox-vendors.paddle.com/catalog
 * 
 * To create test products in Paddle sandbox:
 * 1. Go to Paddle sandbox dashboard
 * 2. Navigate to Catalog > Products
 * 3. Create a product with a one-time price
 * 4. Copy the price ID (starts with pri_)
 */
const SAMPLE_PADDLE_PRICE_IDS = [
    // Add your actual Paddle sandbox price IDs here
    // Format: 'pri_01abc123...'
];

async function addPaddlePrices() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

        // Get all products without paddle price IDs
        const products = await Product.find({ paddlePriceId: { $exists: false } }).limit(50);
        console.log(`Found ${products.length} products without Paddle price IDs`);

        if (products.length === 0) {
            // Check if any products exist
            const allProducts = await Product.find().limit(5);
            if (allProducts.length > 0) {
                console.log('\nExisting products already have Paddle price IDs:');
                allProducts.forEach(p => {
                    console.log(`  - ${p.title}: ${p.paddlePriceId || 'none'}`);
                });
            }
            console.log('\nNo products need Paddle price IDs.');
        } else {
            console.log('\n⚠️  Products found without Paddle price IDs:');
            products.forEach(p => {
                console.log(`  - ${p.title} (${p._id})`);
            });

            console.log(`
=====================================================
  HOW TO ENABLE CARD PAYMENTS WITH PADDLE
=====================================================

To enable card payments, you need to create products in Paddle:

1. Go to Paddle Sandbox Dashboard:
   https://sandbox-vendors.paddle.com/

2. Create Products (Catalog > Products):
   - Click "New Product"
   - Add product name and description
   - Create a one-time price for each product
   - Note down the Price ID (starts with 'pri_')

3. Update your products in MongoDB:
   
   For each product, set the paddlePriceId field:
   
   db.products.updateOne(
      { _id: ObjectId("YOUR_PRODUCT_ID") },
      { $set: { paddlePriceId: "pri_YOUR_PADDLE_PRICE_ID" } }
   )

4. OR run this update for ALL products with a single test price:

   db.products.updateMany(
      {},
      { $set: { paddlePriceId: "pri_YOUR_TEST_PRICE_ID" } }
   )

Once paddlePriceId is set, the card payment option will
automatically appear in checkout!

=====================================================
`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addPaddlePrices();
