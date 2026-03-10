import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081", // [DEV_CONFIG] Updated to match backend application.properties. Original: 8080
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use((config) => {
  /* [DEV_BYPASS] Toggle these lines to switch between Real and Dummy/Missing tokens */
  const token = localStorage.getItem("token") || "demo-token-123"; // Use demo token if none exists
  // const token = localStorage.getItem("token"); 

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;