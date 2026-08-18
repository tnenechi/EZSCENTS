import express from "express";
import { uploadImage } from "../services/cloudinaryService";
import { protect, admin } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import { uploadImageSchema } from "../validation/schemas";

const router = express.Router();

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post("/", protect, admin, validateBody(uploadImageSchema), async (req, res) => {
  try {
    const { image } = req.body;
    const uploadedImage = await uploadImage(image);
    res.json(uploadedImage);
  } catch (error: any) {
    console.error("Upload route error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

export default router;
