import apiClient from "./apiService";

// Login function
export const login = (email, password) => {
  return apiClient.post("/login", { email, password });
};

// Example: Add other authentication methods if needed
export const logout = () => {
  localStorage.removeItem("authToken");
};
