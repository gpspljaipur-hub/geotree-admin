import axios from "axios";
import { API_CONFIG } from "./endpoints";

export const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json"
  }
});

// -------- REQUEST INTERCEPTOR --------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------- RESPONSE INTERCEPTOR --------
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Logging out...");
      localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ================= GLOBAL FUNCTIONS =================

// GET without auth
export const getPublic = async (url, params = {}) => {
  try {
    const res = await axiosInstance.get(url, { params });
    return res;
  } catch (error) {
    console.error("GET Public Error:", error);
    throw error;
  }
};

// GET with auth
export const getAuth = async (url, params = {}) => {
  try {
    const res = await axiosInstance.get(url, { params });
    return res;
  } catch (error) {
    console.error("GET Auth Error:", error);
    throw error;
  }
};

// POST without auth
export const postPublic = async (url, body) => {
  try {
    const res = await axiosInstance.post(url, body);
    return res;
  } catch (error) {
    console.error("POST Public Error:", error);
    throw error;
  }
};

// POST with auth
export const postAuth = async (url, body, config = {}) => {
  try {
    const res = await axiosInstance.post(url, body, config);
    return res;
  } catch (error) {
    console.error("POST Auth Error:", error);
    throw error;
  }
};

// PUT with auth
export const putAuth = async (url, body, config = {}) => {
  try {
    const res = await axiosInstance.put(url, body, config);
    return res;
  } catch (error) {
    console.error("PUT Error:", error);
    throw error;
  }
};

// DELETE with auth
export const deleteAuth = async (url, config = {}) => {
  try {
    const res = await axiosInstance.delete(url, config);
    return res;
  } catch (error) {
    console.error("DELETE Error:", error);
    throw error;
  }
};