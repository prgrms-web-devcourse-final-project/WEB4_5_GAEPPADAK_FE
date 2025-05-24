// components/KeywordSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { keywordService } from "@/src/services/keyword.service";
import { IKeyword } from "@/types";
import { useRouter } from "next/navigation";

export default function KeywordSidebar() {
  const [keywords, setKeywords] = useState<IKeyword.ISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await keywordService.getTop10Summary();
        setKeywords(response.data);
      } catch (error) {
        console.error("Error fetching keywords:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        실시간 키워드
      </h2>
      <div className="space-y-4">
        {keywords.slice(0, 10).map((keyword, index) => (
          <div
            onClick={() => {
              router.push(`/main/keywords/${keyword.text}`);
            }}
            key={keyword.keywordId}
            className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors duration-150"
          >
            <span className="w-6 text-sm text-gray-500 dark:text-gray-400">
              {index + 1}
            </span>
            <span className="flex-1 font-medium text-gray-900 dark:text-white">
              {keyword.text}
            </span>
            <span>{keyword.score > 10000 && "🔥"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
