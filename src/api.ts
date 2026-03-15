import axios from 'axios';
import { secureStorage } from './utils/secureStorage';

const api = axios.create({
  baseURL: 'https://api.zyphra.site/api',  // ✅ free HTTPS via Cloudflare
});

api.interceptors.request.use((config) => {
  const token = secureStorage.getItem('discord_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
