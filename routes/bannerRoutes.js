import express from "express";
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controller/bannerController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { setUploadFolder, upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveBanners);

// Admin only routes
router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.get("/", getAllBanners);
router.post("/", setUploadFolder("banners"), upload.single("image"), createBanner);
router.patch("/:bannerId", setUploadFolder("banners"), upload.single("image"), updateBanner);
router.delete("/:bannerId", deleteBanner);

export default router;
