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
  const [totalPages, setTotalPages] = useState(4);

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
                <div className="w-24 h-24 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      width={96}
                      height={96}
                      className="rounded object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      썸네일
                      <br />
                      이미지
                    </span>
                  )}
                </div>

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
        {posts.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
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

            <span className="mx-2 text-gray-700 dark:text-gray-300">
              {currentPage} | 2 | 3 | 4
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
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
                key={news.id || index}
                href={news.url || "#"}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 relative flex items-center justify-center">
                  {news.thumbnailUrl ? (
                    <Image
                      src={news.thumbnailUrl}
                      alt={news.title || "뉴스 썸네일"}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      썸네일 이미지
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white text-center mb-2">
                  {news.source || "썸네일 이미지"}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                  {news.title || "뉴스 제목"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-center">
                  뉴스 채팅
                </p>
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
