import { Cloudinary } from "@cloudinary/url-gen";
import type { CloudinaryImage as CloudinaryImageType } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
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
  width?: number,
  height?: number,
): CloudinaryImageType | string => {
  if (isCloudinaryImageRef(image)) {
    const cldImage = cld.image(image.publicId).format("auto").quality("auto");
    if (width && height) {
      cldImage.resize(fill(width, height));
    }
    return cldImage;
  }

  return image;
};
