import axios from "axios";

// Create a secure Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ JWT INTERCEPTOR: Automatically attach the token to every request
api.interceptors.request.use(
  (config) => {
    const commanderInfo = JSON.parse(localStorage.getItem("commander") || "{}");
    if (commanderInfo.token) {
      config.headers.Authorization = `Bearer ${commanderInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auto-logout if token expires or is hacked
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error("Session Expired or Invalid. Logging out...");
      localStorage.removeItem("commander");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
