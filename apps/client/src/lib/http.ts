import axios from 'axios';
import env from '@/env';
import { queryClient } from '@/lib/query-client';

export const http = axios.create({
  baseURL: env.API_URL,
  withCredentials: true, // send cookies cross-origin for better-auth sessions
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      queryClient.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
