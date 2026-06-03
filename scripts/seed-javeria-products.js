import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");


dotenv.config({ path: ".env.local" });

const OWNER_ID = "6a0319d7ece43394b81b4457";
const FALLBACK_ATLAS_HOSTS = [
  "ac-0mv7wfn-shard-00-00.4pfvp5b.mongodb.net:27017",
  "ac-0mv7wfn-shard-00-01.4pfvp5b.mongodb.net:27017",
  "ac-0mv7wfn-shard-00-02.4pfvp5b.mongodb.net:27017",
].join(",");

function getMongoUri() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("Missing connection string. Ensure MONGODB_URI or DATABASE_URL is defined in .env.local");
  }

  if (!uri.startsWith("mongodb+srv://")) return uri;

  const parsed = new URL(uri);
  if (parsed.hostname !== "cluster1.4pfvp5b.mongodb.net") return uri;

  return `mongodb://${parsed.username}:${parsed.password}@${FALLBACK_ATLAS_HOSTS}/test?tls=true&authSource=admin&replicaSet=atlas-8zzgn5-shard-0&retryWrites=true&w=majority&appName=Cluster1`;
}

const products = [
  {
    title: "Royal Maroon Bridal Lehenga",
    description: "Premium embroidered bridal lehenga with gold zari details, ideal for wedding and formal events.",
    category: "Lehenga",
    tags: ["women", "female", "bridal", "wedding", "lehenga", "maroon", "gold", "embroidered"],
    audience: "WOMEN",
    basePrice: 420,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90"],
    stock: 8,
    type: "READY_TO_WEAR",
    attributes: { color: "Maroon", fabric: "Silk", pattern: "Zari Embroidery" },
  },
  {
    title: "Ivory Pearl Saree",
    description: "Elegant ivory saree with pearl border and soft drape for receptions, dinners, and festive gatherings.",
    category: "Saree",
    tags: ["women", "female", "saree", "ivory", "pearl", "formal", "party"],
    audience: "WOMEN",
    basePrice: 185,
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=90"],
    stock: 14,
    type: "READY_TO_WEAR",
    attributes: { color: "Ivory", fabric: "Chiffon", pattern: "Pearl Border" },
  },
  {
    title: "Emerald Festive Anarkali",
    description: "Floor-length emerald anarkali with detailed sleeves and flowing silhouette for mehndi or Eid wear.",
    category: "Anarkali",
    tags: ["women", "female", "anarkali", "emerald", "festival", "eid", "mehndi"],
    audience: "WOMEN",
    basePrice: 210,
    images: ["https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=90"],
    stock: 10,
    type: "STITCHED",
    attributes: { color: "Emerald Green", fabric: "Georgette", pattern: "Embroidered" },
  },
  {
    title: "Blush Pink Chiffon Suit",
    description: "Lightweight stitched chiffon suit with dupatta, designed for casual events and day functions.",
    category: "Suit",
    tags: ["women", "female", "ladies suit", "pink", "chiffon", "casual", "dupatta"],
    audience: "WOMEN",
    basePrice: 125,
    images: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=90"],
    stock: 18,
    type: "STITCHED",
    attributes: { color: "Blush Pink", fabric: "Chiffon", pattern: "Floral" },
  },
  {
    title: "Navy Formal Sherwani",
    description: "Structured navy sherwani with subtle embroidery for groom, walima, and formal South Asian events.",
    category: "Sherwani",
    tags: ["men", "male", "sherwani", "navy", "wedding", "formal", "groom"],
    audience: "MEN",
    basePrice: 360,
    images: ["https://images.unsplash.com/photo-1593032465175-481ac7f401f0?auto=format&fit=crop&w=1200&q=90"],
    stock: 6,
    type: "READY_TO_WEAR",
    attributes: { color: "Navy", fabric: "Jamawar", pattern: "Subtle Embroidery" },
  },
  {
    title: "Cream Kurta Pajama Set",
    description: "Classic cream kurta pajama set for men with clean tailoring and breathable fabric.",
    category: "Kurta",
    tags: ["men", "male", "kurta", "kurta pajama", "cream", "eid", "casual"],
    audience: "MEN",
    basePrice: 95,
    images: ["https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2?auto=format&fit=crop&w=1200&q=90"],
    stock: 20,
    type: "STITCHED",
    attributes: { color: "Cream", fabric: "Cotton", pattern: "Plain" },
  },
  {
    title: "Black Waistcoat Set",
    description: "Men's black waistcoat and kurta set for parties, nikah events, and semi-formal gatherings.",
    category: "Waistcoat",
    tags: ["men", "male", "waistcoat", "black", "party", "formal"],
    audience: "MEN",
    basePrice: 145,
    images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=90"],
    stock: 11,
    type: "READY_TO_WEAR",
    attributes: { color: "Black", fabric: "Cotton Blend", pattern: "Textured" },
  },
  {
    title: "Pastel Lawn Three Piece",
    description: "Soft pastel unstitched three-piece lawn suit with printed dupatta for summer daily wear.",
    category: "Unstitched Suit",
    tags: ["women", "female", "lawn", "unstitched", "pastel", "summer", "dupatta"],
    audience: "WOMEN",
    basePrice: 78,
    images: ["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90"],
    stock: 25,
    type: "UNSTITCHED",
    attributes: { color: "Pastel", fabric: "Lawn", pattern: "Printed" },
  },
  {
    title: "Charcoal Office Suit",
    description: "Modern charcoal stitched suit for professional wear, interviews, and office meetings.",
    category: "Formal Suit",
    tags: ["men", "male", "formal", "office", "charcoal", "suit"],
    audience: "MEN",
    basePrice: 240,
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90"],
    stock: 7,
    type: "READY_TO_WEAR",
    attributes: { color: "Charcoal", fabric: "Wool Blend", pattern: "Solid" },
  },
  {
    title: "Gold Mehndi Gharara",
    description: "Festive gold gharara with matching dupatta and embellished detailing for mehndi nights.",
    category: "Gharara",
    tags: ["women", "female", "gharara", "gold", "mehndi", "festival", "wedding"],
    audience: "WOMEN",
    basePrice: 275,
    images: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=1200&q=90"],
    stock: 9,
    type: "READY_TO_WEAR",
    attributes: { color: "Gold", fabric: "Organza", pattern: "Embellished" },
  },
  {
    title: "Sky Blue Casual Kurti",
    description: "Everyday sky blue kurti with comfortable stitching and minimal pattern for casual wear.",
    category: "Kurti",
    tags: ["women", "female", "kurti", "blue", "casual", "cotton"],
    audience: "WOMEN",
    basePrice: 68,
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=90"],
    stock: 22,
    type: "STITCHED",
    attributes: { color: "Sky Blue", fabric: "Cotton", pattern: "Minimal" },
  },
  {
    title: "White Linen Men Kurta",
    description: "Breathable white linen kurta for men, suitable for summer gatherings and casual Fridays.",
    category: "Kurta",
    tags: ["men", "male", "men kurta", "white", "linen", "summer", "casual"],
    audience: "MEN",
    basePrice: 88,
    images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=90"],
    stock: 16,
    type: "STITCHED",
    attributes: { color: "White", fabric: "Linen", pattern: "Plain" },
  },
];

async function main() {
  await mongoose.connect(getMongoUri());

  const owner = await User.findById(OWNER_ID);
  if (!owner) throw new Error(`Shopkeeper user not found: ${OWNER_ID}`);
  if (owner.role !== "SHOPKEEPER") throw new Error(`User ${OWNER_ID} is not a SHOPKEEPER`);

  let shop = await Shop.findOne({ owner: OWNER_ID });
  if (!shop) {
    shop = await Shop.create({
      owner: OWNER_ID,
      name: "Javeria Fashion House",
      description: "Curated Pakistani formal, bridal, casual, and menswear collections.",
      banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=90",
      logo: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=90",
      location: { address: "Main Fashion Market", city: "Karachi", state: "Sindh" },
      businessDetails: { ownerName: owner.name || "Javeria Munawar", businessType: "Fashion Boutique" },
      categoryPermissions: ["Lehenga", "Saree", "Suit", "Kurta", "Sherwani", "Waistcoat", "Gharara", "Formal Suit"],
      isActive: true,
      isVisibleToCustomers: true,
    });
  } else {
    shop.isActive = true;
    shop.isVisibleToCustomers = true;
    shop.name = shop.name || "Javeria Fashion House";
    shop.description = shop.description || "Curated Pakistani formal, bridal, casual, and menswear collections.";
    shop.banner = shop.banner || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=90";
    await shop.save();
  }

  let upserted = 0;
  for (const product of products) {
    const result = await Product.updateOne(
      { shop: shop._id, title: product.title },
      { $set: { ...product, shop: shop._id, isActive: true } },
      { upsert: true }
    );
    if (result.upsertedCount || result.modifiedCount) upserted += 1;
  }

  const total = await Product.countDocuments({ shop: shop._id, isActive: true });
  console.log(JSON.stringify({
    owner: String(owner._id),
    shop: String(shop._id),
    shopName: shop.name,
    productsTouched: upserted,
    activeProductsInShop: total,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Seeding failed error lifecycle hook details:", error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error("Error during connection cleanup:", disconnectError);
  }
  process.exit(1);
});
