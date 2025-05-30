// app/(main)/keyword/[keyword]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { postService } from "@src/services/post.service";
import { newsService } from "@src/services/news.service";
import { IPost } from "@/types";
import { INews } from "@/types/news";
import LoadingSpinner from "@src/components/ui/LoadingSpinner";

export default function KeywordDetailPage() {
  const params = useParams();
  const keyword = decodeURIComponent(params.keyword as string);

  const [posts, setPosts] = useState<IPost.ISummary[]>([]);
  const [newsItems, setNewsItems] = useState<INews.ISource.ISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postsResponse = await postService.getList({
          keyword,
          page: currentPage - 1,
          size: 10,
          sort: "createdAt",
        });
        if (postsResponse && postsResponse.code === "200") {
          setPosts(postsResponse.data.list || []);
          setTotalPages(postsResponse.data.meta.totalPages);
        }

        const newsResponse = await newsService.getSourceNewsList({
          keyword,
          page: 0,
          size: 10,
        });

        if (newsResponse && newsResponse.code === "200") {
          setNewsItems(newsResponse.data.list || []);
        }
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        // 오류 발생 시 빈 배열로 설정
        setPosts([]);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, currentPage]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* 키워드 정보 */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            키워드: {keyword}
          </h1>
        </div>
      </div>

      {/* 포스트 목록 섹션 */}
      <div className="space-y-4 mb-12">
        {posts.length > 0 ? (
          // 포스트가 있는 경우
          posts.map((post) => (
            <Link
              key={post.postId}
              href={`/main/posts/${post.postId}`}
              className="block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex gap-6">
                {/* 썸네일 */}
                {post.thumbnailUrl && (
                  <div className="w-24 h-24 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      width={96}
                      height={96}
                      className="rounded object-cover"
                    />
                  </div>
                )}

                {/* 콘텐츠 */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {post.summary}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {post.source}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {post.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // 포스트가 없는 경우 - 간단한 메시지만 표시
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                조회된 포스트가 없습니다.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                다른 키워드로 검색해 보세요.
              </p>
            </div>
          </div>
        )}

        {/* 페이지네이션 - 포스트가 있을 때만 표시 */}
        {posts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;

                if (totalPages <= maxVisiblePages) {
                  // 총 페이지가 5개 이하인 경우 모든 페이지 표시
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 rounded-md text-sm ${
                          i === currentPage
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // 총 페이지가 5개 초과인 경우
                  if (currentPage <= 3) {
                    // 처음 부분에 있는 경우
                    for (let i = 1; i <= 4; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            i === currentPage
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    pages.push(
                      <span key="dots1" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {totalPages}
                      </button>
                    );
                  } else if (currentPage >= totalPages - 2) {
                    // 끝 부분에 있는 경우
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        1
                      </button>
                    );
                    pages.push(
                      <span key="dots1" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            i === currentPage
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // 중간 부분에 있는 경우
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        1
                      </button>
                    );
                    pages.push(
                      <span key="dots1" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            i === currentPage
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    pages.push(
                      <span key="dots2" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                }

                return pages;
              })()}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 하단 영역: 연관 뉴스/유튜브 통합 섹션 */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          연관 뉴스 / 유튜브
        </h2>

        {newsItems.length > 0 ? (
          // 뉴스/유튜브 데이터가 있는 경우
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newsItems.slice(0, 5).map((news, index) => (
              <Link
                key={news.sourceId || index}
                href={news.url || "#"}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow block h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 relative flex items-center justify-center">
                    {news.thumbnailUrl && news.thumbnailUrl.trim() !== "" ? (
                      <Image
                        src={news.thumbnailUrl}
                        alt={news.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white text-center mb-2">
                    {news.source}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 flex-1">
                    {news.title}
                  </p>
                  <div className="text-center mt-auto">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        news.platform === "YOUTUBE"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {news.platform === "YOUTUBE" ? "유튜브" : "뉴스"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // 뉴스/유튜브 데이터가 없는 경우 - 단일 카드로 처리
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                조회된 뉴스/유튜브가 없습니다.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                관련 컨텐츠를 찾을 수 없습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
