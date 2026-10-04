import express from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controller/serviceController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:serviceId", getServiceById);

router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.post("/", createService);
router.patch("/:serviceId", updateService);
router.delete("/:serviceId", deleteService);

export default router;
