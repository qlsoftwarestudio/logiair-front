import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://logiair-production.up.railway.app",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("logiair-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      //localStorage.removeItem("logiair-auth");
      //window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
