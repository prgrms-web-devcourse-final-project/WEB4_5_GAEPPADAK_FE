"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { newsService } from "@src/services/news.service";
import { videoService } from "@src/services/video.service";
import { postService } from "@src/services/post.service";
import { INews, IVideo, IPost } from "@/types";
import { useUser } from "@/src/contexts/UserContext";

// UI 컴포넌트 임포트
import LoadingSpinner from "@src/components/ui/LoadingSpinner";

// 카드 컴포넌트 임포트
import PostCard from "@src/components/cards/PostCard";
import NewsCard from "@src/components/cards/NewsCard";
import VideoCard from "@src/components/cards/VideoCard";

export default function Home() {
  const [news, setNews] = useState<INews.ISummary[]>([]);
  const [videos, setVideos] = useState<IVideo.ISummary[]>([]);
  const [posts, setPosts] = useState<IPost.ISummary[]>([]);
  const [loading, setLoading] = useState(true);

  // 사용자 정보 가져오기
  const { currentUser, isLoggedIn } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newsRes, videosRes, postsRes] = await Promise.all([
          newsService.getTop10Summary(),
          videoService.getTop10Summary(),
          postService.getTop10Summary(),
        ]);

        setNews(newsRes.data.list);
        setVideos(videosRes.data.list);
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          실시간 포스트 리스트
        </h2>
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.slice(0, 10).map((post, index) => (
              <Link href={`main/posts/${post.postId}`} key={post.postId}>
                <PostCard post={post} index={index} />
              </Link>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center border border-gray-100 dark:border-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                조회된 포스트가 없습니다.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                새로운 포스트가 등록되면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 인기 뉴스 섹션 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            인기 뉴스
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length > 0 ? (
            news
              .slice(0, 5)
              .map((newsItem, index) => (
                <NewsCard key={index} news={newsItem} />
              ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center border border-gray-100 dark:border-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 8l-7 7-7-7"
                  />
                </svg>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  조회된 뉴스가 없습니다.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  인기 뉴스 콘텐츠를 찾을 수 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 인기 유튜브 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            인기 유튜브
          </h2>

          {/* 관리자인 경우 관리 페이지 링크 표시 */}
          {isLoggedIn && currentUser?.role === "ADMIN" && (
            <Link
              href="/management/posts"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
            >
              관리 페이지
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos
              .slice(0, 5)
              .map((video, index) => <VideoCard key={index} video={video} />)
          ) : (
            <div className="col-span-full">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center border border-gray-100 dark:border-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  조회된 유튜브가 없습니다.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  인기 유튜브 콘텐츠를 찾을 수 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
