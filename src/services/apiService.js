import axios from "axios";

// Create an axios instance with the base API URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Base URL from environment variables
  timeout: 10000, // Optional: Set a timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Example of an interceptor for handling authentication or errors
apiClient.interceptors.request.use(
  (config) => {
    // Add Authorization token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
