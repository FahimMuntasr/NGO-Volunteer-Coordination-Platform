import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export default api;