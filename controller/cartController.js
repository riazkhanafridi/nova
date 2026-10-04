import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import { PRODUCT_STATUS } from "../config/constants.js";

const serializeProduct = (product) => {
  if (!product) return product;
  const row = product.toJSON ? product.toJSON() : product;
  return {
    ...row,
    ProductImages: row.images ?? row.ProductImages ?? [],
    Brand: row.brand ?? row.Brand ?? null,
    Category: row.category ?? row.Category ?? null,
  };
};

const serializeCartItem = (item) => {
  if (!item) return item;
  const row = item.toJSON ? item.toJSON() : item;
  const product = row.product ?? row.Product ?? null;
  return {
    ...row,
    Product: product ? serializeProduct(product) : null,
    itemTotal: Number(row.priceAtAdd || row.price || 0) * Number(row.quantity || 0),
  };
};

// ─── Helper: Get or Create Cart ─────────────────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  return cart;
};

// ─── Get Cart ───────────────────────────────────────────────────────────────────
export const getCart = AsyncWrapper(async (req, res, next) => {
  const cart = await Cart.findOne({
    where: { userId: req.user.userId },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["productId", "name", "slug", "price", "comparePrice", "quantity", "status", "brandId", "categoryId"],
            include: [
              { model: Brand, as: "brand", attributes: ["brandId", "name", "logo"] },
              { model: Category, as: "category", attributes: ["categoryId", "name", "slug"] },
              {
                model: ProductImage,
                as: "images",
                required: false,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!cart) {
    return SuccessMessage(res, "Cart is empty", { cartId: null, CartItems: [], total: 0 });
  }

  let subTotal = 0;
  const validItems = [];

  for (const item of cart.items || []) {
    if (item.product && item.product.status === PRODUCT_STATUS.active) {
      const itemTotal = parseFloat(item.product.price) * item.quantity;
      subTotal += itemTotal;
      validItems.push({
        ...serializeCartItem(item),
        itemTotal: Number(itemTotal.toFixed(2)),
      });
    }
  }

  return SuccessMessage(res, "Cart fetched successfully", {
    cartId: cart.cartId,
    CartItems: validItems,
    itemCount: validItems.length,
    subTotal: Number(subTotal.toFixed(2)),
  });
});

// ─── Add Item to Cart ───────────────────────────────────────────────────────────
export const addToCart = AsyncWrapper(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return next(new ErrorHandler("Product ID is required", 400));
  }

  const qty = parseInt(quantity);
  if (qty < 1) {
    return next(new ErrorHandler("Quantity must be at least 1", 400));
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (product.status !== PRODUCT_STATUS.active) {
    return next(new ErrorHandler("Product is not available", 400));
  }

  if (product.quantity < qty) {
    return next(new ErrorHandler(`Only ${product.quantity} units available in stock`, 400));
  }

  const cart = await getOrCreateCart(req.user.userId);

  // Check if item already in cart
  const existingItem = await CartItem.findOne({
    where: { cartId: cart.cartId, productId },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + qty;
    if (product.quantity < newQty) {
      return next(new ErrorHandler(`Only ${product.quantity} units available`, 400));
    }
    existingItem.quantity = newQty;
    existingItem.priceAtAdd = parseFloat(product.price);
    await existingItem.save();
  } else {
    await CartItem.create({
      cartId: cart.cartId,
      productId,
      quantity: qty,
      priceAtAdd: parseFloat(product.price),
    });
  }

  return SuccessMessage(res, "Item added to cart");
});

// ─── Update Cart Item Quantity ───────────────────────────────────────────────────
export const updateCartItem = AsyncWrapper(async (req, res, next) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  const qty = parseInt(quantity);
  if (!qty || qty < 1) {
    return next(new ErrorHandler("Valid quantity is required", 400));
  }

  const cart = await Cart.findOne({ where: { userId: req.user.userId } });
  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  const cartItem = await CartItem.findOne({
    where: { cartItemId, cartId: cart.cartId },
    include: [{ model: Product, as: "product" }],
  });

  if (!cartItem) {
    return next(new ErrorHandler("Cart item not found", 404));
  }

  if (cartItem.product.quantity < qty) {
    return next(new ErrorHandler(`Only ${cartItem.product.quantity} units available`, 400));
  }

  cartItem.quantity = qty;
  await cartItem.save();

  return SuccessMessage(res, "Cart item updated");
});

// ─── Remove Cart Item ────────────────────────────────────────────────────────────
export const removeCartItem = AsyncWrapper(async (req, res, next) => {
  const { cartItemId } = req.params;

  const cart = await Cart.findOne({ where: { userId: req.user.userId } });
  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  const cartItem = await CartItem.findOne({
    where: { cartItemId, cartId: cart.cartId },
  });

  if (!cartItem) {
    return next(new ErrorHandler("Cart item not found", 404));
  }

  await cartItem.destroy();
  return SuccessMessage(res, "Item removed from cart");
});

// ─── Clear Cart ──────────────────────────────────────────────────────────────────
export const clearCart = AsyncWrapper(async (req, res, next) => {
  const cart = await Cart.findOne({ where: { userId: req.user.userId } });
  if (!cart) {
    return SuccessMessage(res, "Cart is already empty");
  }

  await CartItem.destroy({ where: { cartId: cart.cartId } });
  return SuccessMessage(res, "Cart cleared successfully");
});
