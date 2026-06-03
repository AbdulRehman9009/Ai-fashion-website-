export const PRODUCT_IMAGE_FALLBACK = "/product-placeholder.svg";

export function getProductImage(product) {
  if (!product) return PRODUCT_IMAGE_FALLBACK;

  const image = product.imageUrl || product.images?.find((src) => typeof src === "string" && src.trim());
  return image || PRODUCT_IMAGE_FALLBACK;
}

export function useProductImageFallback(event) {
  if (event.currentTarget.src.endsWith(PRODUCT_IMAGE_FALLBACK)) return;
  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}
