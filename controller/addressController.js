import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Address from "../models/Address.js";
import { ADDRESS_TYPE } from "../config/constants.js";

const serializeAddress = (address) => {
  if (!address) return address;
  const data = address.toJSON ? address.toJSON() : address;
  return {
    ...data,
    street: data.addressLine1 || data.street || "",
    zipCode: data.postalCode || data.zipCode || "",
  };
};

// ─── Get My Addresses ────────────────────────────────────────────────────────────
export const getAddresses = AsyncWrapper(async (req, res, next) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.userId },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  return SuccessMessage(res, "Addresses fetched successfully", addresses.map(serializeAddress));
});

// ─── Add Address ─────────────────────────────────────────────────────────────────
export const addAddress = AsyncWrapper(async (req, res, next) => {
  const {
    label,
    recipientName = "",
    phone = "",
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    zipCode,
    street,
    isDefault,
  } = req.body;

  const resolvedAddressLine1 = addressLine1 || street || "";
  const resolvedPostalCode = postalCode || zipCode || "";

  if (!recipientName || !phone || !resolvedAddressLine1 || !city) {
    return next(new ErrorHandler("Recipient name, phone, address and city are required", 400));
  }

  // If this is marked default, unset others
  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.userId } });
  }

  const address = await Address.create({
    userId: req.user.userId,
    label: label || ADDRESS_TYPE.home,
    recipientName,
    phone,
    addressLine1: resolvedAddressLine1,
    addressLine2,
    city,
    state,
    country: country || "Pakistan",
    postalCode: resolvedPostalCode,
    isDefault: isDefault || false,
  });

  return SuccessMessage(res, "Address added successfully", serializeAddress(address), 201);
});

// ─── Update Address ──────────────────────────────────────────────────────────────
export const updateAddress = AsyncWrapper(async (req, res, next) => {
  const { addressId } = req.params;
  const {
    label, recipientName, phone, addressLine1,
    addressLine2, city, state, country, postalCode, isDefault,
  } = req.body;

  const address = await Address.findOne({
    where: { addressId, userId: req.user.userId },
  });

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  // If setting as default, unset others
  if (isDefault) {
    await Address.update(
      { isDefault: false },
      { where: { userId: req.user.userId } }
    );
  }

  const fields = {
    label, recipientName, phone, addressLine1,
    addressLine2, city, state, country, postalCode, isDefault,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) address[key] = value;
  });

  await address.save();
  return SuccessMessage(res, "Address updated successfully", address);
});

// ─── Delete Address ──────────────────────────────────────────────────────────────
export const deleteAddress = AsyncWrapper(async (req, res, next) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    where: { addressId, userId: req.user.userId },
  });

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  await address.destroy();
  return SuccessMessage(res, "Address deleted successfully");
});

// ─── Set Default Address ─────────────────────────────────────────────────────────
export const setDefaultAddress = AsyncWrapper(async (req, res, next) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    where: { addressId, userId: req.user.userId },
  });

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  await Address.update({ isDefault: false }, { where: { userId: req.user.userId } });

  address.isDefault = true;
  await address.save();

  return SuccessMessage(res, "Default address updated", address);
});
