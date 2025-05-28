"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsService } from "@src/services/news.service";
import { videoService } from "@src/services/video.service";
import { INews } from "@/types";
import { IVideo } from "@/types";
import LoadingSpinner from "@src/components/ui/LoadingSpinner";

export default function PopularVideosPage() {
  // 상태 관리
  const [videoList, setVideoList] = useState<IVideo.ISummary[]>([]);
  const [newsList, setNewsList] = useState<INews.ISummaryTop[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        console.error("인기 유튜브 로딩 중 오류 발생:", error);
        setVideoList([]);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage]);

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
      } catch (error) {
        console.error("인기 뉴스 로딩 중 오류 발생:", error);
        setNewsList([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [currentPage]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

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
      <div className="flex justify-center my-8">
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="mx-1"
          >
            ◀
          </button>

          {pagesToRender.map((page, index) => {
            if (page === null) {
              // 줄임표 표시
              return (
                <span key={`ellipsis-${index}`} className="mx-1">
                  ...
                </span>
              );
            }

            return (
              <button
                key={`page-${page}`}
                onClick={() => setCurrentPage(page)}
                className={`mx-1 ${currentPage === page ? "font-bold" : ""}`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="mx-1"
          >
            ▶
          </button>
        </div>
      </div>
    );
  };

  if (videoLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 영역 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          인기 유튜브
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          최신 인기 유튜브를 확인하세요
        </p>
      </div>

      {/* 유튜브 목록 */}
      <div className="space-y-5">
        {videoList.length > 0 ? (
          videoList.map((video, index) => (
            <Link
              key={video.videoId || index}
              href={video.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100 dark:border-gray-700 group-hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row">
                  {/* 썸네일 */}
                  <div className="md:w-32 md:h-32 h-48 relative bg-gray-100 dark:bg-gray-700 flex-shrink-0">
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
                          className="w-12 h-12"
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
                      </div>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 p-5">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                        YouTube
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(video.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // 유튜브가 없는 경우 메시지 표시
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
              다른 키워드로 검색해 보시거나 나중에 다시 확인해 주세요.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 - 유튜브가 있을 때만 표시 */}
      {videoList.length > 0 && renderPagination()}

      {/* 하단 관련 뉴스 섹션 */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            연관 뉴스
          </h2>
          <Link
            href="/news"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            더보기
          </Link>
        </div>

        {newsLoading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner />
          </div>
        ) : newsList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newsList.map((news, index) => (
              <Link
                key={news.sourceId || index}
                href={news.url || "#"}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 group-hover:shadow-md">
                  <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
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
                          className="w-10 h-10"
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
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2 h-10">
                      {news.title || "뉴스 제목"}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // 뉴스가 없는 경우 메시지 표시
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              조회된 뉴스가 없습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              관련 뉴스 콘텐츠를 찾을 수 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
