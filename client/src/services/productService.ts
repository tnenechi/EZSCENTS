import api from "./api";
import type { Product } from "../types";

export const getProducts = async (
  keyword = "", 
  category = "", 
  isFeatured = false, 
  brand = "",
  sort = "",
  pageNumber = 1,
  promotionId = ""
) => {
  const { data } = await api.get<{
    products: Product[];
    page: number;
    pages: number;
  }>(`/products?keyword=${keyword}&category=${category}&isFeatured=${isFeatured}&brand=${brand}&sort=${sort}&pageNumber=${pageNumber}&promotionId=${promotionId}`);
  return data;
};

export const getFilters = async () => {
  const { data } = await api.get<{ brands: string[]; categories: string[] }>("/products/filters");
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

// Admin methods
export const createProduct = async (productData: Partial<Product>) => {
  const { data } = await api.post<Product>("/products", productData);
  return data;
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
) => {
  const { data } = await api.put<Product>(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
