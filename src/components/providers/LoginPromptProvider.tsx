"use client";

import { useEffect, useState } from "react";
import LoginPromptModal from "../ui/LoginPromptModal";
import { loginPromptManager } from "@/src/hooks/useLoginPrompt";

export default function LoginPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = loginPromptManager.subscribe(() => {
      setIsModalOpen(true);
    });

    return unsubscribe;
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {children}
      <LoginPromptModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
