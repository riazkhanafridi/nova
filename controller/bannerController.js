import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Banner from "../models/Banner.js";
import { Op } from "sequelize";

// ─── Get Active Banners (Public) ─────────────────────────────────────────────────
export const getActiveBanners = AsyncWrapper(async (req, res, next) => {
  const now = new Date();

  const banners = await Banner.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { startDate: null },
        { startDate: { [Op.lte]: now } },
      ],
      [Op.and]: [
        {
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: now } },
          ],
        },
      ],
    },
    order: [["sortOrder", "ASC"]],
  });

  return SuccessMessage(res, "Banners fetched successfully", banners);
});

// ─── Admin: Get All Banners ──────────────────────────────────────────────────────
export const getAllBanners = AsyncWrapper(async (req, res, next) => {
  const banners = await Banner.findAll({
    order: [["sortOrder", "ASC"]],
    paranoid: false,
  });
  return SuccessMessage(res, "All banners fetched", banners);
});

// ─── Admin: Create Banner ────────────────────────────────────────────────────────
export const createBanner = AsyncWrapper(async (req, res, next) => {
  const { title, subtitle, link, isActive, sortOrder, startDate, endDate } = req.body;

  if (!title) {
    return next(new ErrorHandler("Banner title is required", 400));
  }

  const image = req.file ? `/uploads/banners/${req.file.filename}` : null;

  if (!image) {
    return next(new ErrorHandler("Banner image is required", 400));
  }

  const banner = await Banner.create({
    title,
    subtitle,
    image,
    link,
    isActive: isActive !== false,
    sortOrder: parseInt(sortOrder) || 0,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  return SuccessMessage(res, "Banner created successfully", banner, 201);
});

// ─── Admin: Update Banner ────────────────────────────────────────────────────────
export const updateBanner = AsyncWrapper(async (req, res, next) => {
  const { bannerId } = req.params;
  const { title, subtitle, link, isActive, sortOrder, startDate, endDate } = req.body;

  const banner = await Banner.findByPk(bannerId);
  if (!banner) {
    return next(new ErrorHandler("Banner not found", 404));
  }

  const fields = { title, subtitle, link, isActive, sortOrder, startDate, endDate };
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined) banner[key] = val;
  });

  if (req.file) banner.image = `/uploads/banners/${req.file.filename}`;

  await banner.save();
  return SuccessMessage(res, "Banner updated successfully", banner);
});

// ─── Admin: Delete Banner ────────────────────────────────────────────────────────
export const deleteBanner = AsyncWrapper(async (req, res, next) => {
  const { bannerId } = req.params;

  const banner = await Banner.findByPk(bannerId);
  if (!banner) {
    return next(new ErrorHandler("Banner not found", 404));
  }

  await banner.destroy();
  return SuccessMessage(res, "Banner deleted successfully");
});
