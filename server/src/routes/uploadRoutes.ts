import express from 'express';
import { uploadImage } from '../services/cloudinaryService';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const uploadedUrl = await uploadImage(image);
    res.json({ url: uploadedUrl });
  } catch (error: any) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

export default router;
