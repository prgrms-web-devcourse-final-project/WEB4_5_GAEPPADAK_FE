"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IMember } from "@/types";
import { memberService } from "@/src/services/member.service";

interface UserContextType {
  currentUser: IMember.Me | null;
  isLoggedIn: boolean;
  updateUser: (user: IMember.Me | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<IMember.Me | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const userData = await memberService.getMe();
      setCurrentUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  };

  // 사용자 정보 업데이트
  const updateUser = (user: IMember.Me | null) => {
    setCurrentUser(user);
    setIsLoggedIn(!!user);
  };

  // 로그아웃
  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // 초기 사용자 정보 로드
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        updateUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
