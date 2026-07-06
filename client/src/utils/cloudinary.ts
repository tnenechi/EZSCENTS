import { Cloudinary } from "@cloudinary/url-gen";
import type { CloudinaryImage as CloudinaryImageType } from "@cloudinary/url-gen";
// using direct string args for format/quality to match SDK method signatures
import type { ImageRef, CloudinaryImageRef } from "../types";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  console.warn(
    "VITE_CLOUDINARY_CLOUD_NAME is not defined. Cloudinary SDK images may not work correctly.",
  );
}

const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName || "demo",
  },
});

export const isCloudinaryImageRef = (
  value: ImageRef,
): value is CloudinaryImageRef => {
  return (
    typeof value !== "string" &&
    value !== null &&
    typeof value === "object" &&
    "publicId" in value
  );
};

export const getImageUrl = (image: ImageRef): string => {
  return typeof image === "string" ? image : image.url;
};

export const buildCloudinaryImage = (
  image: ImageRef,
): CloudinaryImageType | string => {
  if (isCloudinaryImageRef(image)) {
    return cld.image(image.publicId).format("auto").quality("auto");
  }

  return image;
};
