import api from "./api";
import type { CloudinaryImageRef } from "../types";

export type UploadedImageResponse = CloudinaryImageRef;

export const uploadImage = async (
  base64Image: string,
): Promise<CloudinaryImageRef> => {
  const { data } = await api.post<UploadedImageResponse>("/upload", {
    image: base64Image,
  });
  return data;
};
