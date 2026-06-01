const MALE_KEYWORDS = [
  "men",
  "mens",
  "male",
  "boy",
  "boys",
  "gent",
  "gents",
  "sherwani",
  "waistcoat",
  "prince coat",
  "men kurta",
  "kurta pajama",
  "kameez shalwar men",
];

const FEMALE_KEYWORDS = [
  "women",
  "womens",
  "female",
  "girl",
  "girls",
  "lady",
  "ladies",
  "saree",
  "lehenga",
  "dupatta",
  "frock",
  "gown",
  "anarkali",
  "abaya",
  "maxi",
  "women dress",
  "ladies suit",
];

const NEUTRAL_KEYWORDS = [
  "unisex",
  "fabric",
  "cloth",
  "unstitched",
  "shalwar kameez",
  "suit",
  "cotton",
  "lawn",
  "linen",
  "khaddar",
];

export function normalizeGenderPreference(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text || ["auto", "detect", "any", "all", "unisex", "neutral"].includes(text)) return "any";
  if (["male", "men", "mens", "man", "boy", "boys", "gents"].includes(text)) return "male";
  if (["female", "women", "womens", "woman", "girl", "girls", "ladies"].includes(text)) return "female";
  return "any";
}

function asText(value) {
  if (Array.isArray(value)) return value.join(" ");
  if (value && typeof value === "object") return Object.values(value).map(asText).join(" ");
  return String(value || "");
}

export function productSearchText(product) {
  return [
    product.title,
    product.description,
    product.category,
    product.type,
    asText(product.tags),
    asText(product.attributes),
  ].join(" ").toLowerCase();
}

function countKeywordHits(text, keywords) {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
}

export function inferProductGender(product) {
  const text = productSearchText(product);
  const maleScore = countKeywordHits(text, MALE_KEYWORDS);
  const femaleScore = countKeywordHits(text, FEMALE_KEYWORDS);
  const neutralScore = countKeywordHits(text, NEUTRAL_KEYWORDS);

  if (maleScore > femaleScore && maleScore >= 1) return "male";
  if (femaleScore > maleScore && femaleScore >= 1) return "female";
  if (neutralScore > 0 || product.type === "UNSTITCHED") return "any";
  return "any";
}

export function genderMatches(productGender, preferredGender) {
  if (!preferredGender || preferredGender === "any") return true;
  if (!productGender || productGender === "any") return true;
  return productGender === preferredGender;
}

export function isVisibleAvailableProduct(product) {
  if (!product?.isActive || Number(product.stock || 0) <= 0) return false;
  const shop = product.shop;
  if (!shop) return true;
  return shop.isActive !== false && shop.isVisibleToCustomers !== false;
}

function normalizeTerms(terms) {
  return [...new Set((terms || [])
    .flatMap((term) => String(term || "").split(/[,/|]/))
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length > 1))];
}

export function scoreProduct(product, terms, preferredGender) {
  const productGender = inferProductGender(product);
  if (!genderMatches(productGender, preferredGender)) return -1;

  const text = productSearchText(product);
  const normalizedTerms = normalizeTerms(terms);
  let score = productGender === preferredGender ? 8 : 3;

  for (const term of normalizedTerms) {
    if (text.includes(term)) score += term.length > 4 ? 5 : 3;
  }

  if (Number(product.stock || 0) > 0) score += 2;
  if (product.images?.[0]) score += 1;
  if (product.shop?.ratingAvg) score += Math.min(3, product.shop.ratingAvg);

  return score;
}

export function toProductCard(product) {
  const productGender = inferProductGender(product);
  const productUrl = `/products/${product._id}`;
  const shopUrl = product.shop?._id ? `/shops/${product.shop._id}` : null;

  return {
    id: String(product._id),
    _id: String(product._id),
    title: product.title,
    name: product.title,
    price: product.basePrice,
    basePrice: product.basePrice,
    image: product.images?.[0] || null,
    imageUrl: product.images?.[0] || null,
    images: product.images || [],
    type: product.type,
    isStitched: product.type === "STITCHED" || product.type === "READY_TO_WEAR",
    category: product.category,
    stock: product.stock,
    shop: product.shop?.name || "Unknown Shop",
    shopId: product.shop?._id ? String(product.shop._id) : null,
    productUrl,
    href: productUrl,
    url: productUrl,
    shopUrl,
    color: product.attributes?.color,
    fabric: product.attributes?.fabric,
    genderFit: productGender,
  };
}

export function rankProductsForRecommendation(products, recommendation, context = {}) {
  const terms = [
    context.eventType,
    context.style,
    recommendation?.style,
    recommendation?.outfitType,
    ...(recommendation?.searchTags || []),
    ...(recommendation?.colorNames || []),
  ];

  return products
    .map((product) => ({
      product,
      score: scoreProduct(product, terms, context.genderPreference),
    }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

export function buildRecommendationProductMatches(products, recommendations, context = {}) {
  const visibleProducts = products.filter(isVisibleAvailableProduct);
  const used = new Set();

  const withProducts = (recommendations || []).map((recommendation) => {
    const ranked = rankProductsForRecommendation(visibleProducts, recommendation, context);
    let selected = ranked.filter((product) => !used.has(String(product._id))).slice(0, 3);

    if (selected.length < 3) {
      const fill = ranked.filter((product) => !selected.some((item) => String(item._id) === String(product._id)));
      selected = [...selected, ...fill].slice(0, 3);
    }

    selected.forEach((product) => used.add(String(product._id)));
    return {
      ...recommendation,
      matchedProducts: selected.map(toProductCard),
    };
  });

  const matchedIds = [...new Set(withProducts.flatMap((rec) => rec.matchedProducts.map((product) => product.id)))];

  return {
    recommendations: withProducts,
    availableProductsChecked: visibleProducts.length,
    matchedProductIds: matchedIds,
  };
}
