import { Op } from "sequelize";
import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Service from "../models/Service.js";
import { generateSlug } from "../utils/helpers.js";

export const getAllServices = AsyncWrapper(async (req, res) => {
  const { includeInactive } = req.query;

  const where = {};
  if (includeInactive !== "true") where.isActive = true;

  const services = await Service.findAll({
    where,
    order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
  });

  return SuccessMessage(res, "Services fetched successfully", services);
});

export const getServiceById = AsyncWrapper(async (req, res, next) => {
  const { serviceId } = req.params;

  const service = await Service.findByPk(serviceId);
  if (!service) {
    return next(new ErrorHandler("Service not found", 404));
  }

  return SuccessMessage(res, "Service fetched successfully", service);
});

export const createService = AsyncWrapper(async (req, res, next) => {
  const { name, description, shortDescription, price, duration, turnaround, icon, sortOrder, isActive } = req.body;

  if (!name || !price) {
    return next(new ErrorHandler("Service name and price are required", 400));
  }

  const slug = generateSlug(name);
  const existing = await Service.findOne({ where: { slug } });
  if (existing) {
    return next(new ErrorHandler("Service with this name already exists", 409));
  }

  const service = await Service.create({
    name: name.trim(),
    slug,
    description,
    shortDescription,
    price: Number(price),
    duration,
    turnaround,
    icon,
    sortOrder: Number(sortOrder || 0),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  return SuccessMessage(res, "Service created successfully", service, 201);
});

export const updateService = AsyncWrapper(async (req, res, next) => {
  const { serviceId } = req.params;
  const { name, description, shortDescription, price, duration, turnaround, icon, sortOrder, isActive } = req.body;

  const service = await Service.findByPk(serviceId);
  if (!service) {
    return next(new ErrorHandler("Service not found", 404));
  }

  if (name && name !== service.name) {
    const slug = generateSlug(name);
    const conflict = await Service.findOne({
      where: { slug, serviceId: { [Op.ne]: serviceId } },
    });
    if (conflict) {
      return next(new ErrorHandler("Service with this name already exists", 409));
    }
    service.name = name.trim();
    service.slug = slug;
  }

  if (description !== undefined) service.description = description;
  if (shortDescription !== undefined) service.shortDescription = shortDescription;
  if (price !== undefined) service.price = Number(price);
  if (duration !== undefined) service.duration = duration;
  if (turnaround !== undefined) service.turnaround = turnaround;
  if (icon !== undefined) service.icon = icon;
  if (sortOrder !== undefined) service.sortOrder = Number(sortOrder);
  if (isActive !== undefined) service.isActive = Boolean(isActive);

  await service.save();

  return SuccessMessage(res, "Service updated successfully", service);
});

export const deleteService = AsyncWrapper(async (req, res, next) => {
  const { serviceId } = req.params;

  const service = await Service.findByPk(serviceId);
  if (!service) {
    return next(new ErrorHandler("Service not found", 404));
  }

  await service.destroy();
  return SuccessMessage(res, "Service deleted successfully");
});
