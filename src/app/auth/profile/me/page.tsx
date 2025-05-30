"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/contexts/UserContext";
import LoadingSpinner from "@src/components/ui/LoadingSpinner";
import Image from "next/image";
import { authService } from "@src/services/auth.service";
import { AxiosError } from "axios";

export default function ProfileEditPage() {
  const {
    currentUser,
    isLoggedIn,
    logout,
    loading: userLoading,
    refreshUser,
  } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 에러 상태
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // UserContext 로딩 중이면 대기
    if (userLoading) {
      return;
    }

    // 로그인 상태 확인
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    if (currentUser) {
      // 기존 사용자 정보로 폼 초기화
      const birthDate = new Date(currentUser.birthDate);
      setFormData({
        nickname: currentUser.nickname,
        email: currentUser.email,
        birthYear: birthDate.getFullYear().toString(),
        birthMonth: (birthDate.getMonth() + 1).toString().padStart(2, "0"),
        birthDay: birthDate.getDate().toString().padStart(2, "0"),
        newPassword: "",
        confirmPassword: "",
      });
    }

    setLoading(false);
  }, [userLoading, isLoggedIn, router, currentUser]);

  // 입력 값 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // 실시간 검증
    if (field === "nickname" && value.trim()) {
      validateNickname(value);
    } else if (field === "newPassword" && value.trim()) {
      validatePassword(value);
    } else if (field === "confirmPassword" && value.trim()) {
      validatePasswordConfirm(value);
    }
  };

  // 실시간 닉네임 검증
  const validateNickname = (nickname: string) => {
    if (nickname.length < 2 || nickname.length > 10) {
      setErrors((prev) => ({
        ...prev,
        nickname: "닉네임은 2~10자 사이여야 합니다.",
      }));
      return false;
    }
    setErrors((prev) => ({
      ...prev,
      nickname: "",
    }));
    return true;
  };

  // 실시간 비밀번호 검증
  const validatePassword = (password: string) => {
    if (password.length < 8 || password.length > 20) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "비밀번호는 8~20자 사이여야 합니다.",
      }));
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(password)) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.",
      }));
      return false;
    }

    setErrors((prev) => ({
      ...prev,
      newPassword: "",
    }));
    return true;
  };

  // 실시간 비밀번호 확인 검증
  const validatePasswordConfirm = (confirmPassword: string) => {
    if (formData.newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "비밀번호가 일치하지 않습니다.",
      }));
      return false;
    }
    setErrors((prev) => ({
      ...prev,
      confirmPassword: "",
    }));
    return true;
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // 닉네임 검증 (2-10자)
    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (formData.nickname.length < 2 || formData.nickname.length > 10) {
      newErrors.nickname = "닉네임은 2~10자 사이여야 합니다.";
    }

    // 이메일 검증 (사용하지 않지만 기존 로직 유지)
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    // 생년월일 검증 (사용하지 않지만 기존 로직 유지)
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      newErrors.birth = "생년월일을 모두 입력해주세요.";
    }

    // 새 비밀번호 검증 (입력된 경우에만)
    if (formData.newPassword.trim()) {
      // 비밀번호 길이 검증 (8-20자)
      if (formData.newPassword.length < 8 || formData.newPassword.length > 20) {
        newErrors.newPassword = "비밀번호는 8~20자 사이여야 합니다.";
      } else {
        // 비밀번호 복잡성 검증 (영문, 숫자, 특수문자 포함)
        const passwordRegex =
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
        if (!passwordRegex.test(formData.newPassword)) {
          newErrors.newPassword =
            "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.";
        }
      }
    }

    // 비밀번호 확인 검증
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 정보 수정 처리
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 프로필 업데이트 API 호출
      const updateData: { nickname?: string; password?: string } = {};

      // 닉네임이 변경된 경우에만 포함
      if (formData.nickname !== currentUser?.nickname) {
        updateData.nickname = formData.nickname;
      }

      // 비밀번호가 입력된 경우에만 포함
      if (formData.newPassword.trim()) {
        updateData.password = formData.newPassword;
      }

      // 변경사항이 없으면 요청하지 않음
      if (Object.keys(updateData).length === 0) {
        alert("변경된 정보가 없습니다.");
        setLoading(false);
        return;
      }

      await authService.patchProfile(updateData);

      // 프로필 업데이트 성공 후 사용자 정보 새로고침
      await refreshUser();

      // 편집 모드 해제
      setIsEditing(false);

      // 비밀번호 필드 초기화
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      alert("프로필이 성공적으로 업데이트되었습니다.");
      router.push("/main");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);

      // API 응답에서 에러 메시지 추출
      let errorMessage = "프로필 업데이트에 실패했습니다.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 회원 탈퇴 모달 열기
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // 회원 탈퇴 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    setLoading(true);

    try {
      // 회원 탈퇴 API 호출
      await authService.deleteAccount();

      // 회원탈퇴 성공 후 UserContext 상태 업데이트
      logout();

      alert("회원 탈퇴가 완료되었습니다.");
      router.push("/main");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);

      // API 응답에서 에러 메시지 추출
      let errorMessage = "회원 탈퇴에 실패했습니다.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            사용자 정보를 불러올 수 없습니다.
          </h2>
          <button
            onClick={() => router.push("/main")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            회원 정보
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            {isEditing ? "수정 취소" : "정보 수정"}
          </button>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* 회원 정보 수정 섹션 */}
          <div className="mb-8">
            {/* 닉네임 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.nickname && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.nickname}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={true}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* 생년월일 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                생년월일
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="년"
                  value={formData.birthYear}
                  onChange={(e) =>
                    handleInputChange("birthYear", e.target.value)
                  }
                  disabled={true}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="월"
                  value={formData.birthMonth}
                  onChange={(e) =>
                    handleInputChange("birthMonth", e.target.value)
                  }
                  disabled={true}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="일"
                  value={formData.birthDay}
                  onChange={(e) =>
                    handleInputChange("birthDay", e.target.value)
                  }
                  disabled={true}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.birth && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.birth}
                </p>
              )}
            </div>

            {/* 새 비밀번호 */}
            {isEditing && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  placeholder="변경하지 않으려면 비워두세요"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.newPassword && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>
            )}

            {/* 비밀번호 재입력 */}
            {isEditing && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  비밀번호 재입력
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 하단 버튼들 */}
          <div className="flex gap-4">
            <button
              onClick={openDeleteModal}
              disabled={loading}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              회원 탈퇴
            </button>

            <div className="flex-1"></div>

            {isEditing ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인
              </button>
            ) : (
              <button
                onClick={() => router.push("/main")}
                disabled={loading}
                className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                뒤로 가기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              회원 탈퇴 확인
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              정말로 회원 탈퇴하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
