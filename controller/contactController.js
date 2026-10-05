import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import ContactMessage from "../models/ContactMessage.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createContactMessage = AsyncWrapper(async (req, res, next) => {
  const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const topic = typeof req.body.topic === "string" ? req.body.topic.trim() : "";
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

  if (!fullName || !email || !message) {
    return next(new ErrorHandler("Full name, email, and message are required", 400));
  }
  if (!EMAIL_PATTERN.test(email)) {
    return next(new ErrorHandler("Please provide a valid email address", 400));
  }
  if (fullName.length > 150 || phone.length > 40 || email.length > 254 || topic.length > 100) {
    return next(new ErrorHandler("One or more fields exceed the maximum length", 400));
  }
  if (message.length > 10000) {
    return next(new ErrorHandler("Message must be 10000 characters or fewer", 400));
  }

  const contactMessage = await ContactMessage.create({
    fullName,
    phone: phone || null,
    email,
    topic: topic || null,
    message,
  });

  return SuccessMessage(
    res,
    "Your message was received. We will get back to you soon.",
    { contactMessageId: contactMessage.contactMessageId },
    201
  );
});
