import express from "express";
import { getStripeConfig, createPaymentIntent } from "../controller/paymentController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

router.get("/config", getStripeConfig);
router.post("/create-payment-intent", auth, createPaymentIntent);

export default router;
