import api from "./api";
import type { Promotion } from "../types";

export const getActivePromotions = async () => {
  const { data } = await api.get<Promotion[]>("/promotions");
  return data;
};

// Admin methods
export const createPromotion = async (promotionData: Partial<Promotion>) => {
  const { data } = await api.post<Promotion>("/promotions", promotionData);
  return data;
};

export const updatePromotion = async (
  id: string,
  promotionData: Partial<Promotion>,
) => {
  const { data } = await api.put<Promotion>(`/promotions/${id}`, promotionData);
  return data;
};

export const deletePromotion = async (id: string) => {
  const { data } = await api.delete(`/promotions/${id}`);
  return data;
};
