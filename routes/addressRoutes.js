import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controller/addressController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

// All address routes require authentication
router.use(auth);

router.get("/", getAddresses);
router.post("/", addAddress);
router.patch("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);
router.patch("/:addressId/default", setDefaultAddress);

export default router;
