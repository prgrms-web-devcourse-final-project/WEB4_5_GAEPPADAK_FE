"use client";

import { useRouter } from "next/navigation";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({
  isOpen,
  onClose,
}: LoginPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    router.push("/auth/signin");
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          로그인이 필요합니다
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          이 기능을 사용하려면 로그인이 필요합니다.
          <br />
          로그인 페이지로 이동하시겠습니까?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
