import axios from 'axios';
import { getSession } from 'next-auth/react';
import { getForgeWindApiBaseUrl } from '@/lib/forgewind-api';

const API_BASE_URL =
  getForgeWindApiBaseUrl() || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Tokens live in the NextAuth session cookie — retrieve them here for each request.
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
