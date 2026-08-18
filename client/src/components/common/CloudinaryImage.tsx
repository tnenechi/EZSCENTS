import { AdvancedImage } from "@cloudinary/react";
import type { CloudinaryImage as CloudinaryImageType } from "@cloudinary/url-gen";
import { buildCloudinaryImage } from "../../utils/cloudinary";
import type { ImageRef } from "../../types";

interface CloudinaryImageProps {
  image: ImageRef;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
}

const CloudinaryImage = ({
  image,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  decoding = "async",
}: CloudinaryImageProps) => {
  const builtImage = buildCloudinaryImage(image, width, height) as
    | CloudinaryImageType
    | string;

  if (typeof builtImage === "string") {
    return (
      <img
        src={builtImage}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
      />
    );
  }

  return (
    <AdvancedImage
      cldImg={builtImage}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      width={width}
      height={height}
    />
  );
};

export default CloudinaryImage;
