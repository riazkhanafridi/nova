import { Op } from "sequelize";
import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Review from "../models/Review.js";
import { generateSlug, getPagination, getPaginationMeta } from "../utils/helpers.js";
import { PRODUCT_STATUS } from "../config/constants.js";

const serializeProduct = (product) => {
  if (!product) return product;
  const row = product.toJSON ? product.toJSON() : product;
  const productImages = row.images ?? row.ProductImages ?? [];
  const brand = row.brand ?? row.Brand ?? null;
  const category = row.category ?? row.Category ?? null;

  return {
    ...row,
    ProductImages: productImages,
    Brand: brand,
    Category: category,
  };
};

// ─── Get All Products (Public) ──────────────────────────────────────────────────
export const getAllProducts = AsyncWrapper(async (req, res, next) => {
  const {
    page = 1, limit = 12, search, categoryId, brandId,
    minPrice, maxPrice, isFeatured, isBestSeller, isNewArrival,
    sortBy = "createdAt", sortOrder = "DESC", status,
  } = req.query;

  const { offset, page: p, limit: l } = getPagination(page, limit);
  const where = {};

  // Public users only see active products
  where.status = status || PRODUCT_STATUS.active;

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { shortDescription: { [Op.like]: `%${search}%` } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (isFeatured === "true") where.isFeatured = true;
  if (isBestSeller === "true") where.isBestSeller = true;
  if (isNewArrival === "true") where.isNewArrival = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  const validSortFields = ["price", "createdAt", "averageRating", "totalSold", "name"];
  const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: "category", attributes: ["categoryId", "name", "slug"] },
      { model: Brand, as: "brand", attributes: ["brandId", "name", "logo"] },
      {
        model: ProductImage, as: "images",
        where: { isPrimary: true },
        required: false,
        limit: 1,
      },
    ],
    limit: l,
    offset,
    order: [[orderField, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
    distinct: true,
  });

  return SuccessMessage(res, "Products fetched successfully", {
    products: rows.map(serializeProduct),
    pagination: getPaginationMeta(count, p, l),
  });
});

// ─── Get Product By ID or Slug ──────────────────────────────────────────────────
export const getProductById = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.params;

  const where = isNaN(productId)
    ? { slug: productId }
    : { productId: parseInt(productId) };

  const product = await Product.findOne({
    where,
    include: [
      { model: Category, as: "category", attributes: ["categoryId", "name", "slug"] },
      { model: Brand, as: "brand", attributes: ["brandId", "name", "logo"] },
      { model: ProductImage, as: "images", order: [["sortOrder", "ASC"]] },
    ],
  });

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  return SuccessMessage(res, "Product fetched successfully", serializeProduct(product));
});

// ─── Get Featured / Best Seller / New Arrivals ──────────────────────────────────
export const getFeaturedProducts = AsyncWrapper(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const products = await Product.findAll({
    where: { isFeatured: true, status: PRODUCT_STATUS.active },
    include: [
      { model: ProductImage, as: "images", where: { isPrimary: true }, required: false, limit: 1 },
      { model: Brand, as: "brand", attributes: ["brandId", "name"] },
    ],
    limit: parseInt(limit),
    order: [["createdAt", "DESC"]],
  });

  return SuccessMessage(res, "Featured products fetched", products.map(serializeProduct));
});

export const getBestSellers = AsyncWrapper(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const products = await Product.findAll({
    where: { isBestSeller: true, status: PRODUCT_STATUS.active },
    include: [
      { model: ProductImage, as: "images", where: { isPrimary: true }, required: false, limit: 1 },
      { model: Brand, as: "brand", attributes: ["brandId", "name"] },
    ],
    limit: parseInt(limit),
    order: [["totalSold", "DESC"]],
  });

  return SuccessMessage(res, "Best sellers fetched", products.map(serializeProduct));
});

export const getNewArrivals = AsyncWrapper(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const products = await Product.findAll({
    where: { isNewArrival: true, status: PRODUCT_STATUS.active },
    include: [
      { model: ProductImage, as: "images", where: { isPrimary: true }, required: false, limit: 1 },
      { model: Brand, as: "brand", attributes: ["brandId", "name"] },
    ],
    limit: parseInt(limit),
    order: [["createdAt", "DESC"]],
  });

  return SuccessMessage(res, "New arrivals fetched", products.map(serializeProduct));
});

// ─── Create Product (Admin) ─────────────────────────────────────────────────────
export const createProduct = AsyncWrapper(async (req, res, next) => {
  const {
    name, description, shortDescription, sku, price, comparePrice,
    costPrice, quantity, lowStockThreshold, weight, categoryId, brandId,
    isFeatured, isBestSeller, isNewArrival, status, condition,
    specifications, tags,
  } = req.body;

  if (!name || !price) {
    return next(new ErrorHandler("Product name and price are required", 400));
  }

  const slug = generateSlug(name);
  const existing = await Product.findOne({ where: { slug } });
  if (existing) {
    return next(new ErrorHandler("Product with this name already exists", 409));
  }

  const product = await Product.create({
    name, slug, description, shortDescription, sku,
    price: parseFloat(price),
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    costPrice: costPrice ? parseFloat(costPrice) : null,
    quantity: parseInt(quantity) || 0,
    lowStockThreshold: parseInt(lowStockThreshold) || 5,
    weight: weight ? parseFloat(weight) : null,
    categoryId: categoryId || null,
    brandId: brandId || null,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isBestSeller: isBestSeller === "true" || isBestSeller === true,
    isNewArrival: isNewArrival === "true" || isNewArrival === true,
    status: status || PRODUCT_STATUS.active,
    condition: condition || "NEW",
    specifications: specifications ? JSON.parse(specifications) : null,
    tags: tags ? JSON.parse(tags) : null,
  });

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const imagePromises = req.files.map((file, index) =>
      ProductImage.create({
        productId: product.productId,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary: index === 0,
        sortOrder: index,
      })
    );
    await Promise.all(imagePromises);
  }

  const productWithImages = await Product.findByPk(product.productId, {
    include: [{ model: ProductImage, as: "images" }],
  });

  return SuccessMessage(res, "Product created successfully", productWithImages, 201);
});

// ─── Update Product (Admin) ─────────────────────────────────────────────────────
export const updateProduct = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const updateData = req.body;

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (updateData.name && updateData.name !== product.name) {
    const slug = generateSlug(updateData.name);
    const existing = await Product.findOne({
      where: { slug, productId: { [Op.ne]: productId } },
    });
    if (existing) {
      return next(new ErrorHandler("Product with this name already exists", 409));
    }
    product.slug = slug;
    product.name = updateData.name;
  }

  const fields = [
    "description", "shortDescription", "sku", "price", "comparePrice",
    "costPrice", "quantity", "lowStockThreshold", "weight", "categoryId",
    "brandId", "isFeatured", "isBestSeller", "isNewArrival", "status", "condition",
  ];

  fields.forEach((field) => {
    if (updateData[field] !== undefined) product[field] = updateData[field];
  });

  if (updateData.specifications) {
    product.specifications = typeof updateData.specifications === "string"
      ? JSON.parse(updateData.specifications)
      : updateData.specifications;
  }
  if (updateData.tags) {
    product.tags = typeof updateData.tags === "string"
      ? JSON.parse(updateData.tags)
      : updateData.tags;
  }

  await product.save();

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const existing = await ProductImage.count({ where: { productId } });
    const imagePromises = req.files.map((file, index) =>
      ProductImage.create({
        productId,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary: existing === 0 && index === 0,
        sortOrder: existing + index,
      })
    );
    await Promise.all(imagePromises);
  }

  const updated = await Product.findByPk(productId, {
    include: [
      { model: ProductImage, as: "images" },
      { model: Category, as: "category", attributes: ["categoryId", "name"] },
      { model: Brand, as: "brand", attributes: ["brandId", "name"] },
    ],
  });

  return SuccessMessage(res, "Product updated successfully", updated);
});

// ─── Delete Product (Admin) ─────────────────────────────────────────────────────
export const deleteProduct = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await product.destroy();
  return SuccessMessage(res, "Product deleted successfully");
});

// ─── Delete Product Image (Admin) ───────────────────────────────────────────────
export const deleteProductImage = AsyncWrapper(async (req, res, next) => {
  const { imageId } = req.params;

  const image = await ProductImage.findByPk(imageId);
  if (!image) {
    return next(new ErrorHandler("Image not found", 404));
  }

  await image.destroy();
  return SuccessMessage(res, "Image deleted successfully");
});

// ─── Set Primary Image (Admin) ──────────────────────────────────────────────────
export const setPrimaryImage = AsyncWrapper(async (req, res, next) => {
  const { imageId } = req.params;

  const image = await ProductImage.findByPk(imageId);
  if (!image) {
    return next(new ErrorHandler("Image not found", 404));
  }

  // Reset all product images to non-primary
  await ProductImage.update({ isPrimary: false }, { where: { productId: image.productId } });

  // Set this image as primary
  image.isPrimary = true;
  await image.save();

  return SuccessMessage(res, "Primary image updated");
});
