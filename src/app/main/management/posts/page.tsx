"use client";

import { useEffect, useState } from "react";
import { postService } from "@src/services/post.service";
import { IPost, IPagination } from "@/types";

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<IPost.ISummaryForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [query, setQuery] = useState<IPost.GetListQueryDtoForAdmin>({
    page: 0,
    size: 10,
    sort: "reportedAt",
    searchTarget: "post_title",
    searchValue: "",
  });

  // 데이터 로드
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getReportedPosts(query);
      setPosts(response.data.list);
      setTotalPages(Math.ceil(response.data.meta.totalElements / query.size));
    } catch (error) {
      console.error("신고된 게시글 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [query]);

  // 검색 처리
  const handleSearch = () => {
    setQuery((prev) => ({ ...prev, page: 0 }));
    setCurrentPage(0);
  };

  // 정렬 변경
  const handleSortChange = (sort: IPost.SortKey) => {
    setQuery((prev) => ({ ...prev, sort, page: 0 }));
    setCurrentPage(0);
  };

  // 검색 대상 변경
  const handleSearchTargetChange = (searchTarget: IPost.SearchTarget) => {
    setQuery((prev) => ({ ...prev, searchTarget }));
  };

  // 검색어 변경
  const handleSearchValueChange = (searchValue: string) => {
    setQuery((prev) => ({ ...prev, searchValue }));
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
    setCurrentPage(page);
  };

  // 체크박스 처리
  const handleSelectPost = (postId: number) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((post) => post.postId)));
    }
  };

  // 개별 신고 승인
  const handleApproveReport = async (postId: number) => {
    try {
      setActionLoading(postId);
      // TODO: API 호출 - postService.approveReport(postId)
      console.log("신고 승인:", postId);

      // 상태 업데이트
      setPosts((prev) =>
        prev.map((post) =>
          post.keywordId === postId ? { ...post, status: "APPROVED" } : post
        )
      );

      alert("신고가 승인되었습니다.");
    } catch (error) {
      console.error("신고 승인 실패:", error);
      alert("신고 승인에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 개별 신고 거부
  const handleRejectReport = async (postId: number) => {
    try {
      setActionLoading(postId);
      // TODO: API 호출 - postService.rejectReport(postId)
      console.log("신고 거부:", postId);

      // 상태를 거부됨으로 변경
      setPosts((prev) =>
        prev.map((post) =>
          selectedPosts.has(post.postId)
            ? { ...post, status: "REJECTED" }
            : post
        )
      );

      alert("신고가 거부되었습니다.");
    } catch (error) {
      console.error("신고 거부 실패:", error);
      alert("신고 거부에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 일괄 신고 승인
  const handleBulkApprove = async () => {
    if (selectedPosts.size === 0) {
      alert("승인할 게시글을 선택해주세요.");
      return;
    }

    if (!confirm(`선택된 ${selectedPosts.size}개의 신고를 승인하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      await postService.approveReport(Array.from(selectedPosts));

      // 처리된 항목을 화면에서 제거
      setPosts((prev) =>
        prev.filter((post) => !selectedPosts.has(post.postId))
      );

      setSelectedPosts(new Set());
      alert(`${selectedPosts.size}개의 신고가 승인되었습니다.`);
    } catch (error) {
      console.error("일괄 승인 실패:", error);
      alert("일괄 승인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 일괄 신고 거부
  const handleBulkReject = async () => {
    if (selectedPosts.size === 0) {
      alert("거부할 게시글을 선택해주세요.");
      return;
    }

    if (!confirm(`선택된 ${selectedPosts.size}개의 신고를 거부하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      await postService.rejectReport(Array.from(selectedPosts));

      // 상태를 거부됨으로 변경
      setPosts((prev) =>
        prev.map((post) =>
          selectedPosts.has(post.postId)
            ? { ...post, status: "REJECTED" }
            : post
        )
      );

      setSelectedPosts(new Set());
      alert(`${selectedPosts.size}개의 신고가 거부되었습니다.`);
    } catch (error) {
      console.error("일괄 거부 실패:", error);
      alert("일괄 거부에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 신고 사유 표시
  const getReportReasonText = (reasons: IPost.ReportReason[]) => {
    const reasonMap = {
      [IPost.ReportReason.BAD_CONTENT]: "부적절한 내용",
      [IPost.ReportReason.FALSE_INFO]: "허위 정보",
      [IPost.ReportReason.ETC]: "기타",
    };
    return reasons.map((reason) => reasonMap[reason]).join(", ");
  };

  // 상태 표시
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: "대기중",
      APPROVED: "승인됨",
      ACCEPTED: "승인됨",
      REJECTED: "거부됨",
    };
    return statusMap[status] || status;
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "APPROVED":
      case "ACCEPTED":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "REJECTED":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">게시글 관리</h1>

      {/* 검색 및 필터 영역 */}
      <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* 검색 대상 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              검색 대상
            </label>
            <select
              value={query.searchTarget}
              onChange={(e) =>
                handleSearchTargetChange(e.target.value as IPost.SearchTarget)
              }
              className="border border-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-600 text-white"
            >
              <option value="post_title">포스트 제목</option>
              <option value="post_summary">포스트 내용</option>
              <option value="keyword">키워드</option>
              <option value="report_reason">신고 사유</option>
            </select>
          </div>

          {/* 검색어 입력 */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              검색어
            </label>
            <div className="flex">
              <input
                type="text"
                value={query.searchValue || ""}
                onChange={(e) => handleSearchValueChange(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="flex-1 border border-gray-500 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 text-white placeholder-gray-300"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
              >
                검색
              </button>
            </div>
          </div>

          {/* 정렬 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              정렬
            </label>
            <select
              value={query.sort}
              onChange={(e) =>
                handleSortChange(e.target.value as IPost.SortKey)
              }
              className="border border-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-600 text-white"
            >
              <option value="reportedAt">최근 신고 날짜</option>
              <option value="reportCount">신고 횟수</option>
            </select>
          </div>
        </div>
      </div>

      {/* 일괄 처리 버튼 */}
      {selectedPosts.size > 0 && (
        <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-200 text-sm">
              {selectedPosts.size}개 게시글 선택됨
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                일괄 승인
              </button>
              <button
                onClick={handleBulkReject}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                일괄 거부
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-600 border-b border-gray-500">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      posts.length > 0 && selectedPosts.size === posts.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="min-w-[200px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  포스트 제목
                </th>
                <th className="min-w-[250px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  포스트 내용
                </th>
                <th className="min-w-[120px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  키워드
                </th>
                <th className="min-w-[150px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  신고 사유
                </th>
                <th className="min-w-[120px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  최근 신고 날짜
                </th>
                <th className="min-w-[100px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  신고 횟수
                </th>
                <th className="min-w-[100px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-300"
                  >
                    신고된 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.postId} className="hover:bg-gray-600">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPosts.has(post.postId)}
                        onChange={() => handleSelectPost(post.postId)}
                        className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-100 font-medium">
                      <div className="max-w-[200px] truncate">{post.title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <div className="max-w-[250px] truncate">
                        {post.summary}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-100 font-medium">
                      <div className="max-w-[120px] truncate">
                        {post.keyword}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <div className="max-w-[150px] truncate">
                        {getReportReasonText(post.reportReason)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(post.reportedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-100 font-medium text-center">
                      {post.reportCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}
                      >
                        {getStatusText(post.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded-md border border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum =
                Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-md border border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
