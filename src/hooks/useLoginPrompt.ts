"use client";

// 전역 상태 관리를 위한 간단한 구현
let loginPromptCallbacks: (() => void)[] = [];

export const loginPromptManager = {
  showLoginPrompt: () => {
    loginPromptCallbacks.forEach((callback) => callback());
  },

  subscribe: (callback: () => void) => {
    loginPromptCallbacks.push(callback);

    // cleanup 함수 반환
    return () => {
      loginPromptCallbacks = loginPromptCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  },
};
