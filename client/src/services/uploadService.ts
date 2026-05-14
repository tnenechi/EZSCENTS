import api from './api';

export const uploadImage = async (base64Image: string) => {
  const { data } = await api.post<{ url: string }>('/upload', { image: base64Image });
  return data.url;
};
