// src/pages/courseBuilder/courseBuilder.http.ts
import axios from "axios";

/**
 * baseURL 규칙:
 * - VITE_API_BASE_URL이 "http://localhost:8484" 면 prefix로 "/api"를 붙여쓴다.
 * - VITE_API_BASE_URL이 "http://localhost:8484/api" 면 prefix는 "" (중복 방지)
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8484";

export function apiPrefix() {
  const hasApiSuffix = /\/api\/?$/.test(BASE_URL);
  return hasApiSuffix ? "" : "/api";
}

/** path는 항상 "/course", "/festival/search" 같은 형태로 넣는다 */
export function withApi(path: string) {
  return `${apiPrefix()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ✅ 요청마다 토큰 자동으로 박기 (course / search 전부 동일 적용)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
