export const GUEST_CART_KEY = 'nova_guest_cart';

const toPriceNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;

  const normalized = value.trim().replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (!normalized || normalized === '.' || normalized === '-' || normalized === '-.') return null;
  const price = Number(normalized);
  return Number.isFinite(price) ? price : null;
};

export const getCartItemPrice = (item) => {
  const candidates = [item?.price, item?.Product?.price, item?.product?.price];
  for (const candidate of candidates) {
    const price = toPriceNumber(candidate);
    if (price !== null) return price;
  }
  return 0;
};

function emitGuestCartUpdate() {
  if (typeof window === 'undefined') return;
  const count = getGuestCartCount();
  window.dispatchEvent(new CustomEvent('nova-cart-count-changed', { detail: { count } }));
}

export function notifyCartUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nova-cart-updated'));
  }
}

export function getGuestCart() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function getGuestCartCount() {
  return getGuestCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
}

export function setGuestCart(items) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    emitGuestCartUpdate();
  }
  return items;
}

function normalizeGuestItemId(value) {
  return String(value ?? '').trim();
}

export function addGuestCartItem(product, quantity = 1) {
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  const items = getGuestCart();
  const guestProductId = normalizeGuestItemId(product.productId ?? product.id ?? `guest-${Date.now()}`);
  const existingIndex = items.findIndex(
    (item) => normalizeGuestItemId(item.productId ?? item.cartItemId) === guestProductId
  );

  if (existingIndex >= 0) {
    items[existingIndex].quantity += nextQuantity;
    items[existingIndex].price = Number(product.price) || items[existingIndex].price || 0;
    items[existingIndex].Product = product;
    items[existingIndex].productId = guestProductId;
    items[existingIndex].cartItemId = guestProductId;
  } else {
    items.push({
      cartItemId: guestProductId,
      productId: guestProductId,
      quantity: nextQuantity,
      price: Number(product.price) || 0,
      Product: product,
    });
  }

  return setGuestCart(items);
}

export function updateGuestCartItem(productId, quantity) {
  const normalizedProductId = normalizeGuestItemId(productId);
  const items = getGuestCart();
  const nextItems = items
    .map((item) => {
      const currentItemId = normalizeGuestItemId(item.productId ?? item.cartItemId ?? '');
      const storedLegacyId = normalizeGuestItemId(`guest-${item.productId}`);
      const matches = currentItemId === normalizedProductId || storedLegacyId === normalizedProductId || normalizeGuestItemId(item.cartItemId) === normalizedProductId;

      return matches ? { ...item, productId: currentItemId || normalizedProductId, cartItemId: currentItemId || normalizedProductId, quantity: Math.max(0, Number(quantity) || 0) } : item;
    })
    .filter((item) => item.quantity > 0);

  return setGuestCart(nextItems);
}

export function removeGuestCartItem(productId) {
  const normalizedProductId = normalizeGuestItemId(productId);
  const items = getGuestCart().filter((item) => {
    const currentItemId = normalizeGuestItemId(item.productId ?? item.cartItemId ?? '');
    const storedLegacyId = normalizeGuestItemId(`guest-${item.productId}`);
    return currentItemId !== normalizedProductId && storedLegacyId !== normalizedProductId && normalizeGuestItemId(item.cartItemId) !== normalizedProductId;
  });
  return setGuestCart(items);
}

export function clearGuestCart() {
  const items = setGuestCart([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nova-cart-cleared'));
  }
  return items;
}

export function clearAllCartState() {
  clearGuestCart();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nova-cart-count-changed', { detail: { count: 0 } }));
    window.dispatchEvent(new CustomEvent('nova-cart-cleared'));
  }
}

export function subscribeToGuestCartCount(callback) {
  if (typeof window === 'undefined') return () => {};

  const handle = () => callback(getGuestCartCount());
  window.addEventListener('nova-cart-count-changed', handle);
  window.addEventListener('nova-cart-cleared', handle);
  return () => {
    window.removeEventListener('nova-cart-count-changed', handle);
    window.removeEventListener('nova-cart-cleared', handle);
  };
}
