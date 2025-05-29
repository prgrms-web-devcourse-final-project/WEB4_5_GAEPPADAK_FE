"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsService } from "@src/services/news.service";
import { videoService } from "@src/services/video.service";
import { INews } from "@/types";
import { IVideo } from "@/types";
import LoadingSpinner from "@src/components/ui/LoadingSpinner";

export default function PopularNewsPage() {
  // 상태 관리
  const [newsList, setNewsList] = useState<INews.ISummaryTop[]>([]);
  const [videoList, setVideoList] = useState<IVideo.ISummary[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 뉴스 데이터 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        const response = await newsService.getPopularNews({
          page: currentPage - 1,
          size: 5,
        });

        setNewsList(response.data.list || []);

        // API 응답에서 totalPages 가져오기
        if (
          response.data &&
          response.data.meta &&
          response.data.meta.totalPages
        ) {
          setTotalPages(response.data.meta.totalPages);
        } else {
          // 페이지 정보가 없는 경우 기본값 설정
          setTotalPages(1);
        }
      } catch (error) {
        console.error("인기 뉴스 로딩 중 오류 발생:", error);
        setNewsList([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [currentPage]);

  // 비디오 데이터 가져오기
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideoLoading(true);
        const response = await videoService.getPopularVideos({
          page: currentPage - 1,
          size: 5,
        });

        setVideoList(response.data.list || []);
      } catch (error) {
        console.error("인기 비디오 로딩 중 오류 발생:", error);
        setVideoList([]);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // UTC 시간을 KST로 변환 (UTC + 9시간)
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, "0");
    const day = String(kstDate.getDate()).padStart(2, "0");
    const hours = String(kstDate.getHours()).padStart(2, "0");
    const minutes = String(kstDate.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 페이지네이션 렌더링 함수 - 페이지 수가 많을 때 줄임 표시 추가
  const renderPagination = () => {
    // 화면에 표시할 페이지 버튼 최대 개수
    const maxPageButtons = 5;
    let pagesToRender = [];

    if (totalPages <= maxPageButtons) {
      // 전체 페이지 수가 최대 표시 개수보다 적으면 모든 페이지 표시
      pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // 전체 페이지가 많은 경우 현재 페이지 주변과 첫/마지막 페이지만 표시
      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽인 경우: 1, 2, 3, 4, ... N
        pagesToRender = [1, 2, 3, 4, null, totalPages];
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽인 경우: 1, ... N-3, N-2, N-1, N
        pagesToRender = [
          1,
          null,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        // 현재 페이지가 중간인 경우: 1, ... P-1, P, P+1, ... N
        pagesToRender = [
          1,
          null,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          null,
          totalPages,
        ];
      }
    }

    return (
      <div className="flex justify-center mt-10 mb-12">
        <nav className="inline-flex rounded-md shadow-sm -space-x-px overflow-hidden">
          {/* 이전 페이지 버튼 */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 ${
              currentPage === 1
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            } text-sm border border-gray-200 dark:border-gray-700`}
          >
            <span className="sr-only">이전</span>
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

          {/* 페이지 버튼들 */}
          {pagesToRender.map((page, index) => {
            if (page === null) {
              // 줄임표 표시
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={`page-${page}`}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 ${
                  currentPage === page
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-sm border border-gray-200 dark:border-gray-700`}
              >
                {page}
              </button>
            );
          })}

          {/* 다음 페이지 버튼 */}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-2 ${
              currentPage === totalPages
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            } text-sm border border-gray-200 dark:border-gray-700`}
          >
            <span className="sr-only">다음</span>
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
        </nav>
      </div>
    );
  };

  if (newsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 헤더 영역 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          인기 뉴스
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          최신 인기 뉴스를 확인하세요
        </p>
      </div>

      {/* 뉴스 목록 */}
      <div className="space-y-5">
        {newsList.length > 0 ? (
          newsList.map((news, index) => (
            <Link
              key={news.sourceId || index}
              href={news.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row">
                  {/* 썸네일 */}
                  <div className="md:w-32 md:h-32 h-48 relative bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {news.thumbnailUrl ? (
                      <Image
                        src={news.thumbnailUrl}
                        alt={news.title || ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-12 h-12"
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

                  {/* 내용 */}
                  <div className="flex-1 p-5">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-1">
                      {news.description}
                    </p>
                    <div className="flex justify-end items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {news.publishedAt ? formatDate(news.publishedAt) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // 뉴스가 없는 경우 메시지 표시
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              조회된 뉴스가 없습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              다른 키워드로 검색해 보시거나 나중에 다시 확인해 주세요.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 - 뉴스가 있을 때만 표시 */}
      {newsList.length > 0 && renderPagination()}

      {/* 하단 관련 유튜브 섹션 */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            연관 유튜브
          </h2>
          <Link
            href="/main/popular-videos"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            더보기
          </Link>
        </div>

        {videoLoading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner />
          </div>
        ) : videoList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {videoList.map((video, index) => (
              <Link
                key={video.videoId || index}
                href={video.url || "#"}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 group-hover:shadow-md">
                  <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title || ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-10 h-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* 재생 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-gray-800"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2 h-10">
                      {video.title || "유튜브 제목"}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // 비디오가 없는 경우 메시지 표시
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
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
              관련 유튜브 콘텐츠를 찾을 수 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
