import api from './api';
import type{ User } from '../types';

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post<User>('/auth/login', { email, password });
  return data;
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const { data } = await api.post<User>('/auth/register', { name, email, password });
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const { data } = await api.put<{ message: string }>('/auth/profile/password', { currentPassword, newPassword });
  return data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const { data } = await api.put<{ message: string }>(`/auth/reset-password/${token}`, { password });
  return data;
};
