import axios from "axios";

const baseURL = typeof window === "undefined" 
  ? process.env.INTERNAL_API_URL || "http://api:3002/api/v1" 
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token from zustand store on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("booksteam-auth");
      if (raw) {
        const state = JSON.parse(raw);
        const token = state?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch { /* ignore */ }
  }
  return config;
});

export default api;
