import { Op } from "sequelize";
import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Brand from "../models/Brand.js";
import { generateSlug } from "../utils/helpers.js";

// ─── Get All Brands ─────────────────────────────────────────────────────────────
export const getAllBrands = AsyncWrapper(async (req, res, next) => {
  const { includeInactive } = req.query;
  const where = {};
  if (!includeInactive) where.isActive = true;

  const brands = await Brand.findAll({
    where,
    order: [["name", "ASC"]],
  });

  return SuccessMessage(res, "Brands fetched successfully", brands);
});

// ─── Get Brand By ID ────────────────────────────────────────────────────────────
export const getBrandById = AsyncWrapper(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await Brand.findByPk(brandId);
  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }
  return SuccessMessage(res, "Brand fetched successfully", brand);
});

// ─── Create Brand (Admin) ───────────────────────────────────────────────────────
export const createBrand = AsyncWrapper(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return next(new ErrorHandler("Brand name is required", 400));
  }

  const slug = generateSlug(name);
  const existing = await Brand.findOne({ where: { slug } });
  if (existing) {
    return next(new ErrorHandler("Brand with this name already exists", 409));
  }

  const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;

  const brand = await Brand.create({ name, slug, description, logo });
  return SuccessMessage(res, "Brand created successfully", brand, 201);
});

// ─── Update Brand (Admin) ───────────────────────────────────────────────────────
export const updateBrand = AsyncWrapper(async (req, res, next) => {
  const { brandId } = req.params;
  const { name, description, isActive } = req.body;

  const brand = await Brand.findByPk(brandId);
  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }

  if (name && name !== brand.name) {
    const slug = generateSlug(name);
    const existing = await Brand.findOne({
      where: { slug, brandId: { [Op.ne]: brandId } },
    });
    if (existing) {
      return next(new ErrorHandler("Brand with this name already exists", 409));
    }
    brand.name = name;
    brand.slug = slug;
  }

  if (description !== undefined) brand.description = description;
  if (isActive !== undefined) brand.isActive = isActive;
  if (req.file) brand.logo = `/uploads/brands/${req.file.filename}`;

  await brand.save();
  return SuccessMessage(res, "Brand updated successfully", brand);
});

// ─── Delete Brand (Admin) ───────────────────────────────────────────────────────
export const deleteBrand = AsyncWrapper(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await Brand.findByPk(brandId);
  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }
  await brand.destroy();
  return SuccessMessage(res, "Brand deleted successfully");
});
