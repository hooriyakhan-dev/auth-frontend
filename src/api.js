import axios from "axios";

const base = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

const make = (path) => {
  const i = axios.create({ baseURL: base + path });
  // Attach the token to every request automatically
  i.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return i;
};

export const expApi = make("/expenses");
export default make("/auth");
