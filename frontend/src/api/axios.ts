import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8484/api",
  withCredentials: true,
});

// JWT 토큰을 자동으로 헤더에 추가하는 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
