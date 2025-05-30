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
import { useUser } from "@/src/contexts/UserContext";
import NewsCard from "@src/components/cards/NewsCard";
import VideoCard from "@src/components/cards/VideoCard";
import { AxiosError } from "axios";

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
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [reportingComment, setReportingComment] = useState<number | null>(null);
  const [reportingPost, setReportingPost] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<
    IComment.ReportReason | IPost.ReportReason | null
  >(null);
  const [etcReason, setEtcReason] = useState<string>("");

  // Context에서 사용자 정보 가져오기
  const { currentUser, isLoggedIn } = useUser();

  // 현재 사용자가 댓글 작성자인지 확인
  const isMyComment = (commentNickname: string) => {
    return currentUser?.nickname === commentNickname;
  };

  // 댓글 신고 모달 열기
  const openReportModal = (commentId: number) => {
    setReportingComment(commentId);
    setReportReason(null);
    setEtcReason("");
  };

  // 포스트 신고 모달 열기
  const openPostReportModal = () => {
    setReportingPost(true);
    setReportReason(null);
    setEtcReason("");
  };

  // 댓글 신고 모달 닫기
  const closeReportModal = () => {
    setReportingComment(null);
    setReportingPost(false);
    setReportReason(null);
    setEtcReason("");
  };

  // 댓글 신고 처리
  const handleReportComment = async () => {
    if (!reportingComment || !reportReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    // 기타 사유가 선택되었는데 사유를 입력하지 않은 경우
    if (reportReason === IComment.ReportReason.ETC && !etcReason.trim()) {
      alert("기타 사유를 입력해주세요.");
      return;
    }

    try {
      const reportDto: IComment.ReportDto = {
        reason: reportReason as IComment.ReportReason,
        ...(reportReason === IComment.ReportReason.ETC &&
          etcReason.trim() && {
            etcReason: etcReason,
          }),
      };

      await commentService.reportComment(reportingComment, reportDto);
      alert("신고가 접수되었습니다.");
      closeReportModal();

      // 댓글 목록 새로고침하여 reportedByMe 상태 업데이트
      const { list, meta } = await commentService.getComments(postId, {
        page: currentPage - 1,
        size: 10,
        sort: "createdAt,DESC",
      });
      setComments(list);
      setCommentCount(meta.totalElements);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("신고 처리에 실패했습니다.");
    }
  };

  // 포스트 신고 처리
  const handleReportPost = async () => {
    if (!reportReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    // 기타 사유가 선택되었는데 사유를 입력하지 않은 경우
    if (reportReason === IPost.ReportReason.ETC && !etcReason.trim()) {
      alert("기타 사유를 입력해주세요.");
      return;
    }

    try {
      const reportDto: IPost.ReportDto = {
        reason: reportReason as IPost.ReportReason,
        ...(reportReason === IPost.ReportReason.ETC &&
          etcReason.trim() && {
            etcReason: etcReason,
          }),
      };

      await postService.reportPost(postId, reportDto);
      alert("신고가 접수되었습니다.");
      closeReportModal();

      // 포스트 정보 새로고침하여 reportedByMe 상태 업데이트
      const response = await postService.getDetail(postId);
      setPost(response.data);
    } catch (error) {
      console.error("Error reporting post:", error);
      alert("신고 처리에 실패했습니다.");
    }
  };

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

      // 401 에러(로그인 관련)는 axios 인터셉터가 처리하므로 여기서는 다른 에러만 처리
      if (error instanceof AxiosError && error.response?.status !== 401) {
        alert("댓글 작성에 실패했습니다.");
      } else if (!(error instanceof AxiosError)) {
        // AxiosError가 아닌 다른 에러의 경우에도 알림 표시
        alert("댓글 작성에 실패했습니다.");
      }
    }
  };

  // 댓글 펼치기/접기 토글
  const toggleCommentExpansion = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  // 댓글 수정 시작
  const startEditComment = (commentId: number, currentBody: string) => {
    setEditingComment(commentId);
    setEditText(currentBody);
  };

  // 댓글 수정 취소
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditText("");
  };

  // 댓글 수정 완료
  const handleEditComment = async (commentId: number) => {
    if (!editText.trim()) return;

    try {
      await commentService.updateComment(commentId, editText);
      setEditingComment(null);
      setEditText("");

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
      console.error("Error updating comment:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await commentService.deleteComment(commentId);

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
      console.error("Error deleting comment:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 댓글 좋아요/좋아요 취소
  const handleLikeComment = async (
    commentId: number,
    isCurrentlyLiked: boolean
  ) => {
    try {
      if (isCurrentlyLiked) {
        // 현재 좋아요 상태이면 좋아요 취소
        await commentService.unlikeComment(commentId);
      } else {
        // 현재 좋아요하지 않은 상태이면 좋아요
        await commentService.likeComment(commentId);
      }

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
      console.error("Error toggling comment like:", error);

      // 401 에러(로그인 관련)는 axios 인터셉터가 처리하므로 여기서는 다른 에러만 처리
      if (error instanceof AxiosError && error.response?.status !== 401) {
        alert("좋아요 처리에 실패했습니다.");
      } else if (!(error instanceof AxiosError)) {
        // AxiosError가 아닌 다른 에러의 경우에도 알림 표시
        alert("좋아요 처리에 실패했습니다.");
      }
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // UTC 시간을 KST로 변환 (UTC + 9시간)
      const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

      const year = kstDate.getFullYear();
      const month = String(kstDate.getMonth() + 1).padStart(2, "0");
      const day = String(kstDate.getDate()).padStart(2, "0");
      const hours = String(kstDate.getHours()).padStart(2, "0");
      const minutes = String(kstDate.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return dateString; // 파싱 실패시 원본 반환
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
            className={`px-3 py-1 rounded-md cursor-pointer ${
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
            className={`px-3 py-1 rounded-md cursor-pointer ${
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
            className={`px-3 py-1 rounded-md cursor-pointer ${
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
    <>
      <div className="max-w-4xl mx-auto w-full overflow-hidden">
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
            <div className="flex justify-between items-start mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {post.keyword}
              </span>

              {/* 포스트 신고 버튼 */}
              {isLoggedIn && !post.reportedByMe && (
                <button
                  onClick={openPostReportModal}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors cursor-pointer"
                >
                  신고
                </button>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {post.title}
            </h1>
          </div>

          {/* 썸네일 이미지 */}
          <div className="px-6 py-8">
            {post.thumbnailUrl ? (
              <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative mb-6">
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <></>
            )}

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
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={150}
                placeholder="댓글 입력 창"
                rows={1}
                className="w-full px-4 py-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
                style={{
                  minHeight: "48px",
                  height: "auto",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="submit"
                className="absolute right-2 bottom-2 px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer"
              >
                입력
              </button>
            </div>

            {/* 글자 수 표시 */}
            <div className="flex justify-between items-center mt-2 text-sm">
              <div></div>
              <div
                className={`${
                  comment.length > 140
                    ? "text-red-500 dark:text-red-400"
                    : comment.length > 120
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {comment.length}/150
                {comment.length > 140 && (
                  <span className="ml-2 text-red-500 dark:text-red-400">
                    (글자 수 제한에 가까워졌습니다)
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="space-y-6 overflow-hidden">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.commentId} className="flex gap-4 min-h-fit">
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
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {comment.nickname}
                      </p>

                      {editingComment === comment.commentId ? (
                        // 편집 모드
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            maxLength={150}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="댓글을 수정하세요..."
                          />

                          {/* 수정 모드 글자 수 표시 */}
                          <div className="flex justify-end text-sm">
                            <div
                              className={`${
                                editText.length > 140
                                  ? "text-red-500 dark:text-red-400"
                                  : editText.length > 120
                                    ? "text-orange-500 dark:text-orange-400"
                                    : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {editText.length}/150
                              {editText.length > 140 && (
                                <span className="ml-2 text-red-500 dark:text-red-400">
                                  (글자 수 제한에 가까워졌습니다)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditComment(comment.commentId)
                              }
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                            >
                              저장
                            </button>
                            <button
                              onClick={cancelEditComment}
                              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 일반 표시 모드
                        <>
                          <p className="text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap leading-relaxed word-break overflow-wrap-anywhere">
                            {expandedComments.has(comment.commentId)
                              ? comment.body
                              : comment.body.slice(0, 50)}
                            {comment.body.length > 50 &&
                              !expandedComments.has(comment.commentId) &&
                              "..."}
                          </p>
                          {comment.body.length > 50 && (
                            <button
                              onClick={() =>
                                toggleCommentExpansion(comment.commentId)
                              }
                              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1 block cursor-pointer"
                            >
                              {expandedComments.has(comment.commentId)
                                ? "접기"
                                : "더보기"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {/* 좋아요/추천 버튼 - 내 댓글과 남의 댓글 구분 */}
                      {isLoggedIn && isMyComment(comment.nickname) ? (
                        // 내 댓글인 경우: 클릭할 수 없는 추천 수만 표시
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          ❤️ {comment.likeCount}
                        </span>
                      ) : (
                        // 남의 댓글인 경우: 클릭 가능한 좋아요 버튼
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleLikeComment(
                              comment.commentId,
                              comment.likedByMe
                            );
                          }}
                          className={`text-sm flex items-center gap-1 transition-colors cursor-pointer ${
                            comment.likedByMe
                              ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                              : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          }`}
                        >
                          {comment.likedByMe ? "❤️" : "🤍"} {comment.likeCount}
                        </button>
                      )}

                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>

                      {/* 내 댓글인 경우에만 수정/삭제 버튼 표시 */}
                      {isLoggedIn &&
                        isMyComment(comment.nickname) &&
                        editingComment !== comment.commentId && (
                          <>
                            <button
                              onClick={() =>
                                startEditComment(
                                  comment.commentId,
                                  comment.body
                                )
                              }
                              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                            >
                              수정
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteComment(comment.commentId)
                              }
                              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                            >
                              삭제
                            </button>
                          </>
                        )}

                      {/* 남의 댓글인 경우에만 신고 버튼 표시 */}
                      {isLoggedIn &&
                        !isMyComment(comment.nickname) &&
                        !comment.reportedByMe &&
                        editingComment !== comment.commentId && (
                          <button
                            onClick={() => openReportModal(comment.commentId)}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors cursor-pointer"
                          >
                            신고
                          </button>
                        )}
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
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-pointer"
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-pointer"
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

      {/* 댓글 신고 모달 */}
      {(reportingComment || reportingPost) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {reportingPost ? "포스트 신고 모달" : "댓글 신고 모달"}
            </h3>

            <div className="space-y-3 mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={
                    reportingPost
                      ? IPost.ReportReason.BAD_CONTENT
                      : IComment.ReportReason.BAD_CONTENT
                  }
                  checked={
                    reportReason ===
                    (reportingPost
                      ? IPost.ReportReason.BAD_CONTENT
                      : IComment.ReportReason.BAD_CONTENT)
                  }
                  onChange={(e) =>
                    setReportReason(
                      e.target.value as
                        | IComment.ReportReason
                        | IPost.ReportReason
                    )
                  }
                  className="mr-3 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  부적절한 내용을 담고 있습니다
                </span>
              </label>

              {/* 댓글 신고에만 표시되는 옵션들 */}
              {!reportingPost && (
                <>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={IComment.ReportReason.RUDE_LANGUAGE}
                      checked={
                        reportReason === IComment.ReportReason.RUDE_LANGUAGE
                      }
                      onChange={(e) =>
                        setReportReason(e.target.value as IComment.ReportReason)
                      }
                      className="mr-3 cursor-pointer"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      불쾌한 표현이 있습니다
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={IComment.ReportReason.SPAM}
                      checked={reportReason === IComment.ReportReason.SPAM}
                      onChange={(e) =>
                        setReportReason(e.target.value as IComment.ReportReason)
                      }
                      className="mr-3 cursor-pointer"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      광고성 게시글입니다
                    </span>
                  </label>
                </>
              )}

              {/* 포스트 신고에만 표시되는 옵션 */}
              {reportingPost && (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={IPost.ReportReason.FALSE_INFO}
                    checked={reportReason === IPost.ReportReason.FALSE_INFO}
                    onChange={(e) =>
                      setReportReason(e.target.value as IPost.ReportReason)
                    }
                    className="mr-3 cursor-pointer"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    잘못된 정보입니다
                  </span>
                </label>
              )}

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={
                    reportingPost
                      ? IPost.ReportReason.ETC
                      : IComment.ReportReason.ETC
                  }
                  checked={
                    reportReason ===
                    (reportingPost
                      ? IPost.ReportReason.ETC
                      : IComment.ReportReason.ETC)
                  }
                  onChange={(e) =>
                    setReportReason(
                      e.target.value as
                        | IComment.ReportReason
                        | IPost.ReportReason
                    )
                  }
                  className="mr-3 cursor-pointer"
                />
                <span className="text-gray-700 dark:text-gray-300">기타</span>
              </label>

              {/* 기타 사유 입력란 */}
              {reportReason ===
                (reportingPost
                  ? IPost.ReportReason.ETC
                  : IComment.ReportReason.ETC) && (
                <div className="ml-6 mt-2">
                  <textarea
                    value={etcReason}
                    onChange={(e) => setEtcReason(e.target.value)}
                    placeholder="기타 사유를 입력해주세요"
                    maxLength={200}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {etcReason.length}/200
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeReportModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={reportingPost ? handleReportPost : handleReportComment}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
