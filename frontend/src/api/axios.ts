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

// 응답 인터셉터: 토큰 만료 시 자동 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      const requestUrl = error.config?.url || '';
      
      // GET 요청의 리뷰 조회는 인증이 필요 없으므로 조용히 처리
      if (requestUrl.includes('/reviews/place/') && error.config?.method === 'get') {
        // GET 요청이므로 에러를 그대로 전달 (컴포넌트에서 조용히 처리)
        return Promise.reject(error);
      }
      
      if (token) {
        // 토큰이 있는데 401이면 만료된 것
        console.warn('토큰이 만료되었습니다.');
        localStorage.removeItem('token');
        
        // POST, PUT, DELETE 요청에서만 토큰 제거
        // GET 요청은 인증이 필요 없으므로 토큰을 제거하지 않음
        if (error.config?.method && ['post', 'put', 'delete'].includes(error.config.method.toLowerCase())) {
          // 현재 페이지가 로그인 페이지가 아닌 경우에만 알림
          if (!window.location.pathname.includes('/login')) {
            // 필요시 로그인 페이지로 리다이렉트
            // window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);