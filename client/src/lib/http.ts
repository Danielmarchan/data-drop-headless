import axios from 'axios';
import env from '@/env';

export const http = axios.create({
  baseURL: env.API_URL,
  withCredentials: true, // send cookies cross-origin for better-auth sessions
});
