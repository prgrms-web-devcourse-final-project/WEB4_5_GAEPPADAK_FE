"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { postService } from "@src/services/post.service";
import { INews, IPost, IVideo } from "@/types";
import LoadingSpinner from "@src/components/ui/LoadingSpinner";
import { commentService } from "@/src/services/comment.service";
import { IComment } from "@/types/comment";
import { newsService } from "@/src/services/news.service";
import { videoService } from "@/src/services/video.service";
import NewsCard from "@src/components/cards/NewsCard";
import VideoCard from "@src/components/cards/VideoCard";

export default function PostDetailPage() {
  const params = useParams();
  const postId = Number(params.id);
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [news, setNews] = useState<INews.ISource.ISummaryForPost[]>([]);
  const [videos, setVideos] = useState<IVideo.ISource.ISummary[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postService.getDetail(postId);
        setPost(response.data);

        const { data: videoList } = await videoService.getSourceVideos(postId);
        setVideos(videoList.list);

        const { data: newsList } = await newsService.getSourceNews(postId);

        setNews(newsList.list);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      const { list, meta } = await commentService.getComments(postId, {
        page: currentPage - 1,
        size: 10,
        sort: "createdAt,DESC",
      });

      setComments(list);
      setCommentCount(meta.totalElements);
      setTotalPages(meta.totalPages);
    };

    fetchComments();
  }, [currentPage, postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await commentService.createComment(postId, comment);
      setComment("");
      // 댓글 목록 새로고침
      const { list, meta } = await commentService.getComments(postId, {
        page: currentPage - 1,
        size: 10,
        sort: "createdAt,DESC",
      });
      setComments(list);
      setCommentCount(meta.totalElements);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("댓글 작성에 실패했습니다. 로그인해주세요.");
    }
  };

  // 페이지네이션 렌더링 함수
  const renderPagination = () => {
    const pages = [];

    // 전체 페이지가 5개 이하인 경우, 모든 페이지 번호 표시
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // 처음 페이지 버튼
      if (currentPage > 3) {
        pages.push(
          <button
            key={1}
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            1
          </button>
        );

        // 중간에 생략 표시
        if (currentPage > 4) {
          pages.push(
            <span key="ellipsis1" className="px-2 text-gray-500">
              ...
            </span>
          );
        }
      }

      // 현재 페이지 주변 표시
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {i}
          </button>
        );
      }

      // 중간에 생략 표시
      if (currentPage < totalPages - 3) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      // 마지막 페이지 버튼
      if (currentPage < totalPages - 1) {
        pages.push(
          <button
            key={totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {totalPages}
          </button>
        );
      }
    }

    return pages;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          게시글을 찾을 수 없습니다.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
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
        포스트 화면
      </Link>

      {/* 메인 콘텐츠 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        {/* 포스트 헤더 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 mb-4">
            {post.keyword}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
        </div>

        {/* 썸네일 이미지 */}
        <div className="px-6 py-8">
          <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative mb-6">
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32">
                  <Image
                    src="/sample-image.png"
                    alt="Sample"
                    width={150}
                    height={100}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 포스트 내용 */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {post.summary}
            </p>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          댓글 ({commentCount}개)
        </h3>

        {/* 댓글 입력 폼 */}
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글 입력 창"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              입력
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.commentId} className="flex gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                  {comment.profileUrl && (
                    <Image
                      src={comment.profileUrl}
                      alt={comment.nickname}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {comment.nickname}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      추천
                      {comment.likeCount}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              댓글이 없습니다. 첫 댓글을 작성해보세요!
            </p>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
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

            <div className="flex items-center">{renderPagination()}</div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
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

      {/* 뉴스 추천 섹션 */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            관련 뉴스
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length > 0 ? (
            news.slice(0, 5).map((newsItem, index) => (
              <NewsCard
                key={index}
                news={{
                  newsId: newsItem.sourceId,
                  title: newsItem.title,
                  url: newsItem.url || "#",
                  thumbnailUrl: newsItem.thumbnailUrl,
                  publishedAt: "",
                  summary: "",
                  platform: "",
                }}
              />
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
                  관련 뉴스가 없습니다.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  이 포스트와 관련된 뉴스 콘텐츠를 찾을 수 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 유튜브 추천 섹션 */}
      <section className="mt-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            관련 유튜브
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos.slice(0, 5).map((video, index) => (
              <VideoCard
                key={index}
                video={{
                  videoId: video.id,
                  title: video.title,
                  url: video.url || "#",
                  thumbnailUrl: video.thumbnailUrl,
                  publishedAt: "",
                  platform: "YOUTUBE",
                }}
              />
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  관련 유튜브가 없습니다.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  이 포스트와 관련된 유튜브 콘텐츠를 찾을 수 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
