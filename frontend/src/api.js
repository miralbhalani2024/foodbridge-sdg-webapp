// api.js — one Axios instance used by the whole app.
import axios from 'axios';

const api = axios.create({
  // In development Vite proxies "/api" to http://localhost:5000 (see vite.config.js).
  // When deploying the frontend separately, set VITE_API_URL to the backend URL.
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api',
});

// INTERCEPTOR: runs before every request → automatically attaches the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any Axios error into a readable message for the UI
export const errorMessage = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach server — is the backend running?' : err.message);

export default api;
