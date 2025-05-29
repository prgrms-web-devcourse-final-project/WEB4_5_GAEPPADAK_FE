"use client";

import { ReactNode } from "react";
import KeywordSidebar from "@/src/components/sidebar/KeywordList";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main>
        <div className="flex max-w-7xl mx-auto">
          <div className="flex-1 min-w-0 max-w-4xl">
            <div className="container mx-auto px-6 py-8 overflow-hidden">
              {children}
            </div>
          </div>

          <aside className="w-80 pl-8 hidden lg:block flex-shrink-0">
            <div className="sticky top-24">
              <KeywordSidebar />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
