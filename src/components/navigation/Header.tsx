import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NavTab from "@src/components/ui/NavTab";
import { authService } from "@src/services/auth.service";
import { useUser } from "@/src/contexts/UserContext";

interface HeaderProps {
  initialActiveTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  initialActiveTab = "home",
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const { currentUser, isLoggedIn, logout: contextLogout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // 경로에 따라 활성 탭 설정
  useEffect(() => {
    if (pathname === "/main") {
      setActiveTab("home");
    } else if (pathname === "/main/popular-news") {
      setActiveTab("news");
    } else if (pathname === "/main/popular-videos") {
      setActiveTab("video");
    }
  }, [pathname]);

  // 탭 클릭 처리
  const handleTabClick = (tab: string, path: string) => {
    setActiveTab(tab);
    router.push(path);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await authService.signout();
      contextLogout(); // Context의 로그아웃 함수 호출
      router.push("/main");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-1">
            <NavTab
              label="홈"
              active={activeTab === "home"}
              onClick={() => handleTabClick("home", "/main")}
            />
            <NavTab
              label="인기 뉴스"
              active={activeTab === "news"}
              onClick={() => handleTabClick("news", "/main/popular-news")}
            />
            <NavTab
              label="인기 유튜브"
              active={activeTab === "video"}
              onClick={() => handleTabClick("video", "/main/popular-videos")}
            />
          </nav>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  로그아웃
                </button>
                <Link href="/profile">
                  <div className="flex items-center px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    <span>내 프로필</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <button className="px-4 py-2 rounded-full text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    회원가입
                  </button>
                </Link>
                <Link href="/auth/signin">
                  <button className="px-4 py-2 rounded-full text-sm text-white bg-blue-600 hover:bg-blue-700">
                    로그인
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
