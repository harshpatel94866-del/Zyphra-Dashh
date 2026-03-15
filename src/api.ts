import axios from 'axios';
import { secureStorage } from './utils/secureStorage';

const api = axios.create({
  baseURL: 'http://172.174.246.240:25255/api',
});

api.interceptors.request.use((config) => {
  const token = secureStorage.getItem('discord_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
