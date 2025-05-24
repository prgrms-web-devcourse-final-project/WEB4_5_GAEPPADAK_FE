import axios from "axios";
import { authService } from "./auth.service";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosInstance.defaults.withCredentials = true;

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 원래 요청 설정 가져오기
    const originalRequest = error.config;

    // 401 오류이고 재시도하지 않은 요청인 경우
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // TODO : fix Refresh call repeat
      // try {
      //   // 토큰 갱신 시도
      //   await authService.refreshToken();

      //   // 토큰 갱신 후 원래 요청 재시도
      //   return axiosInstance(originalRequest);
      // } catch (refreshError) {
      //   // 토큰 갱신 실패 시 로그아웃 처리를 여기서 할 수도 있음
      //   // 예: await authService.signout();
      //   // 혹은 로그인 페이지로 리다이렉트하는 로직

      //   return Promise.reject(error);
      // }
    }

    // 다른 모든 오류는 그대로 반환
    return Promise.reject(error);
  }
);
