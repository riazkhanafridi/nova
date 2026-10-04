import { Op } from "sequelize";
import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Category from "../models/Category.js";
import { generateSlug } from "../utils/helpers.js";

// ─── Get All Categories ─────────────────────────────────────────────────────────
export const getAllCategories = AsyncWrapper(async (req, res, next) => {
  const { includeInactive, parentOnly } = req.query;

  const where = {};
  if (!includeInactive) where.isActive = true;
  if (parentOnly === "true") where.parentId = null;

  const categories = await Category.findAll({
    where,
    include: [
      {
        model: Category,
        as: "subCategories",
        where: includeInactive ? {} : { isActive: true },
        required: false,
      },
    ],
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });

  return SuccessMessage(res, "Categories fetched successfully", categories);
});

// ─── Get Single Category ────────────────────────────────────────────────────────
export const getCategoryById = AsyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findByPk(categoryId, {
    include: [{ model: Category, as: "subCategories" }],
  });

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  return SuccessMessage(res, "Category fetched successfully", category);
});

// ─── Create Category (Admin) ────────────────────────────────────────────────────
export const createCategory = AsyncWrapper(async (req, res, next) => {
  const { name, description, parentId, sortOrder } = req.body;

  if (!name) {
    return next(new ErrorHandler("Category name is required", 400));
  }

  const slug = generateSlug(name);

  const existing = await Category.findOne({ where: { slug } });
  if (existing) {
    return next(new ErrorHandler("Category with this name already exists", 409));
  }

  const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    parentId: parentId || null,
    sortOrder: sortOrder || 0,
  });

  return SuccessMessage(res, "Category created successfully", category, 201);
});

// ─── Update Category (Admin) ────────────────────────────────────────────────────
export const updateCategory = AsyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, description, parentId, sortOrder, isActive } = req.body;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  if (name && name !== category.name) {
    const slug = generateSlug(name);
    const existing = await Category.findOne({
      where: { slug, categoryId: { [Op.ne]: categoryId } },
    });
    if (existing) {
      return next(new ErrorHandler("Category with this name already exists", 409));
    }
    category.name = name;
    category.slug = slug;
  }

  if (description !== undefined) category.description = description;
  if (parentId !== undefined) category.parentId = parentId;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (isActive !== undefined) category.isActive = isActive;
  if (req.file) category.image = `/uploads/categories/${req.file.filename}`;

  await category.save();

  return SuccessMessage(res, "Category updated successfully", category);
});

// ─── Delete Category (Admin) ────────────────────────────────────────────────────
export const deleteCategory = AsyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  await category.destroy();
  return SuccessMessage(res, "Category deleted successfully");
});
