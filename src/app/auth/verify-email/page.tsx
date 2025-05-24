"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@src/services/auth.service";
import { AxiosError } from "axios";
import Link from "next/link";

const EmailVerificationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-20 w-20 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        }
      >
        <EmailVerificationForm />
      </Suspense>
    </div>
  );
};

function EmailVerificationForm() {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리 파라미터에서 이메일 가져오기
  const email = searchParams.get("email") || "";

  // 시간 포맷팅 (분:초)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      setError("인증 시간이 만료되었습니다. 다시 시도해주세요.");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    const verifyEmail = async () => {
      console.log(email);
      await authService.sendEmailAuth(email);
    };
    verifyEmail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.");
      setSuccess("");
      return;
    }

    if (timeLeft <= 0) {
      setError("인증 시간이 만료되었습니다. 다시 시도해주세요.");
      setSuccess("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await authService.checkEmail({
        email,
        authCode: verificationCode,
      });

      setSuccess("이메일 인증이 완료되었습니다.");
      setError("");
      setIsRedirecting(true);

      // 성공 시 다음 페이지로 이동 (필요에 따라 변경)
      setTimeout(() => {
        router.push("/auth/signin"); // 또는 다음 단계로 이동
      }, 2000);
    } catch (error) {
      setSuccess("");
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        setError("인증 과정에서 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 리다이렉트 중일 때 로딩 화면 표시
  if (isRedirecting) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="mx-auto w-48 h-48 relative mb-8 rounded-full overflow-hidden bg-white shadow flex items-center justify-center">
              <div className="relative w-36 h-36">
                <Image
                  src="/kkokkio.png"
                  alt="로고"
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-12 w-12 text-indigo-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                인증 완료!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                로그인 페이지로 이동 중입니다...
              </p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="mx-auto w-48 h-48 relative mb-8 rounded-full overflow-hidden bg-white shadow flex items-center justify-center">
            <div className="relative w-36 h-36">
              <Image
                src="/kkokkio.png"
                alt="로고"
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            이메일 인증
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {email}로 전송된 인증 코드를 입력하세요
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md text-sm">
            <div className="flex">
              <svg
                className="h-5 w-5 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-400 rounded-md text-sm">
            <div className="flex">
              <svg
                className="h-5 w-5 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              인증 코드
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="py-3 pl-10 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 dark:text-white text-sm"
                placeholder="6자리 코드 입력"
                maxLength={6}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-red-500">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  인증 중...
                </>
              ) : (
                "인증 확인"
              )}
            </button>
          </div>

          <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                인증 코드를 받지 못하셨나요?
              </span>
              <button
                onClick={async () => {
                  try {
                    setError(""); // 기존 에러 클리어
                    setSuccess(""); // 기존 성공 메시지 클리어
                    await authService.sendEmailAuth(email);
                    setTimeLeft(300);
                    setSuccess("인증 코드가 재전송되었습니다.");
                  } catch (error) {
                    setSuccess(""); // 성공 메시지 클리어
                    setError("인증 코드 재전송에 실패했습니다.");
                  }
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                type="button"
              >
                인증 코드 재전송
              </button>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              로그인 페이지로 돌아가기{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
