import axios from "axios";
import { authService } from "./auth.service";
import { loginPromptManager } from "@/src/hooks/useLoginPrompt";

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

    // 401 오류 처리
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message;

      // "만료된 토큰입니다." 메시지인 경우 토큰 갱신 시도
      if (errorMessage === "만료된 토큰입니다." && !originalRequest._retry) {
        originalRequest._retry = true;

        // TODO : fix Refresh call repeat
        try {
          // 토큰 갱신 시도
          await authService.refreshToken();

          // 토큰 갱신 후 원래 요청 재시도
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리를 여기서 할 수도 있음
          // 예: await authService.signout();
          // 혹은 로그인 페이지로 리다이렉트하는 로직

          return Promise.reject(error);
        }
      }

      // "로그인 상태가 아닙니다." 메시지인 경우 로그인 프롬프트 모달 표시
      if (errorMessage === "로그인 상태가 아닙니다.") {
        loginPromptManager.showLoginPrompt();
      }
    }

    // 다른 모든 오류는 그대로 반환
    return Promise.reject(error);
  }
);
