import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileStr: string) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "ezscents_products",
      eager: [
        {
          width: 400,
          height: 500,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
        {
          width: 800,
          height: 1000,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });
    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

export default cloudinary;
