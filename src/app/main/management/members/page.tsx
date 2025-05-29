"use client";

import { useEffect, useState } from "react";
import { memberService } from "@src/services/member.service";
import { IMember, IPagination } from "@/types";

export default function MembersManagementPage() {
  const [members, setMembers] = useState<IMember.ISummaryForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<IMember.GetListQueryDtoForAdmin>({
    page: 0,
    size: 10,
    searchTarget: "nickname",
    searchValue: "",
  });

  // 데이터 로드
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getMemberList(query);
      setMembers(response.data.list);
      setTotalPages(Math.ceil(response.data.meta.totalElements / query.size));
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [query]);

  // 검색 처리
  const handleSearch = () => {
    setQuery((prev) => ({ ...prev, page: 0 }));
    setCurrentPage(0);
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

  // 역할 변경 처리
  const handleRoleChange = async (
    memberId: string,
    newBlockType: IMember.blockType
  ) => {
    try {
      await memberService.updateMemberRole(memberId, newBlockType);

      // 상태 업데이트
      setMembers((prev) =>
        prev.map((member) =>
          member.memberId === memberId
            ? { ...member, blockType: newBlockType }
            : member
        )
      );

      alert(
        `상태가 ${newBlockType === "BLACK" ? "차단" : "정상"}으로 변경되었습니다.`
      );
    } catch (error) {
      console.error("역할 변경 실패:", error);
      alert("역할 변경에 실패했습니다.");
    }
  };

  // 역할 표시
  const getRoleText = (role: IMember.roleType) => {
    return role === "ADMIN" ? "관리자" : "유저";
  };

  // 차단 상태 표시
  const getBlockText = (blockType: IMember.blockType) => {
    return blockType === "BLACK" ? "차단" : "정상";
  };

  // 역할별 색상
  const getRoleColor = (role: IMember.roleType) => {
    return role === "ADMIN"
      ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
      : "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
  };

  // 차단 상태별 색상
  const getBlockColor = (blockType: IMember.blockType) => {
    return blockType === "BLACK"
      ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
      : "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">회원 리스트</h1>

      {/* 검색 영역 */}
      <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 p-4 mb-6">
        <div className="flex gap-4 items-end">
          {/* 검색 대상 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              검색 대상
            </label>
            <select
              value={query.searchTarget}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  searchTarget: e.target
                    .value as IMember.GetListQueryDtoForAdmin["searchTarget"],
                }))
              }
              className="border border-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-600 text-white"
            >
              <option value="nickname">닉네임</option>
              <option value="email">이메일</option>
              <option value="role">역할</option>
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
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-gray-700 rounded-lg shadow-sm border border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-600 border-b border-gray-500">
              <tr>
                <th className="min-w-[150px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  닉네임
                </th>
                <th className="min-w-[250px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  이메일
                </th>
                <th className="min-w-[200px] px-4 py-3 text-left text-sm font-medium text-gray-100">
                  역할/상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-300"
                  >
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.memberId} className="hover:bg-gray-600">
                    <td className="px-4 py-3 text-sm text-gray-100 font-medium">
                      <div className="max-w-[150px] truncate">
                        {member.nickname}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <div className="max-w-[250px] truncate">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {member.role === "ADMIN" ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}
                          >
                            {getRoleText(member.role)}
                          </span>
                        ) : (
                          <select
                            value={member.blockType || "USER"}
                            onChange={(e) =>
                              handleRoleChange(
                                member.memberId,
                                e.target.value as IMember.blockType
                              )
                            }
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              member.blockType === "BLACK"
                                ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                                : "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                            }`}
                          >
                            <option value="USER">유저</option>
                            <option value="BLACK">블랙</option>
                          </select>
                        )}
                      </div>
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
                Math.max(0, Math.min(totalPages - 4, currentPage - 2)) + i;
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
