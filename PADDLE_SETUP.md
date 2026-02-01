# Paddle Integration Guide

## Current Issue: "You aren't permitted to perform this request"

This error means your Paddle API key doesn't have the required permissions to create products and prices.

---

## Solution Options

### Option 1: Fix Paddle API Key Permissions (Recommended for Production)

1. **Go to Paddle Dashboard**: https://sandbox-vendors.paddle.com/
2. **Developer Tools → Authentication**
3. **Check your API key permissions**:
   - It needs: `product:write`, `price:write`
   - If missing, create a NEW API key with these permissions
4. **Update `.env.local`** with the new key
5. **Restart dev server**

### Option 2: Disable Auto-Sync (Quick Fix for Development)

Add this to your `.env.local`:
```env
PADDLE_AUTO_SYNC=false
```

**What this does:**
- Products will be created in your database ✅
- Paddle sync will be skipped ✅
- No errors during product creation ✅
- You can manually add `paddlePriceId` later when needed

**Restart dev server after adding this.**

---

## Option 3: Manual Price ID Assignment

If you want card payments but can't fix the API key:

1. **Disable auto-sync** (Option 2 above)
2. **Create products in Paddle Dashboard manually**:
   - Go to Catalog → Products
   - Create product with a one-time price
   - Copy the Price ID (starts with `pri_`)
3. **Update your database**:
   ```javascript
   db.products.updateOne(
     { _id: ObjectId("YOUR_PRODUCT_ID") },
     { $set: { paddlePriceId: "pri_YOUR_PRICE_ID" } }
   )
   ```

---

## Recommended Approach

**For now**: Use **Option 2** (disable auto-sync) so you can create products without errors.

**For production**: Fix the API key permissions (Option 1) before going live.

---

## Testing

After choosing an option:
1. Create a new product
2. Check console - should see "Paddle auto-sync disabled" or success message
3. Product should be created successfully ✅
