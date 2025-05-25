export interface IComment {
  commentId: number;

  memberId: string;

  nickname: string;

  body: string;

  likeCount: number;

  createdAt: string;

  profileUrl: string;

  isLiked: boolean;
}

export namespace IComment {
  export enum ReportReason {
    BAD_CONTENT = "BAD_CONTENT",
    RUDE_LANGUAGE = "RUDE_LANGUAGE",
    SPAM = "SPAM",
    FALSE_INFO = "FALSE_INFO",
    ETC = "ETC",
  }

  export interface ILike {
    id: number;

    memberId: number;

    body: string;

    likeCount: number;

    createdAt: string;
  }

  export interface ISummaryForAdmin {
    commentId: number; // 댓글 id
    memberId: string; // 사용자 id
    nickname: string; // 사용자 닉네임
    postId: number; // 포스트 id
    title: string; // 포스트 제목
    body: string; // 댓글 내용
    reportReason: ReportReason[]; // 신고 이유 (중복 신고된 경우 여러개가 들어갈 수 있음)
    reportedAt: string; // 신고 시각 2025-04-25 13:00
    reportCount: number; // 신고 횟수
    status: string; // 신고 상태
  }

  export class CreateDto {
    body!: string;
  }

  export class UpdateDto {
    body!: string;
  }

  export class GetListQueryDto {
    page!: number;

    size!: number;

    sort!: "likeCount,DESC" | "createdAt,DESC";
  }

  export class ReportDto {
    reason!: ReportReason;
  }

  export type SearchTarget =
    | "nickname"
    | "post_title"
    | "comment_body"
    | "report_reason";

  export type SortKey = "reportedAt" | "reportCount";

  export class GetListQueryDtoForAdmin {
    page!: number;

    size!: number;

    sort: SortKey = "reportedAt";

    searchTarget: SearchTarget = "post_title";

    searchValue?: string;
  }
}
