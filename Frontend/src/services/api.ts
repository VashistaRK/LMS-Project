import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send cookies by default
});

// Attach Authorization header from localStorage token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('app_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('app_token', token);
  } else {
    localStorage.removeItem('app_token');
  }
}

export default api;
