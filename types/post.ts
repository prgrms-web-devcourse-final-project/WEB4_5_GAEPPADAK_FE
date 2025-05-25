export interface IPost extends IPost.IBase {}

export namespace IPost {
  export enum ReportReason {
    BAD_CONTENT = "BAD_CONTENT",
    FALSE_INFO = "FALSE_INFO",
    ETC = "ETC",
  }

  export interface IBase {
    postId: number;
    keyword: string;
    title: string;
    summary: string;
    thumbnailUrl: string;
  }

  export interface ISummary extends IBase {
    source: string;

    createdAt: string;
  }

  export interface ISummaryForAdmin {
    keywordId: number;

    reportReason: ReportReason[];

    reportAt: string;

    reportCount: number;

    status: string;
  }

  export class GetListQueryDto {
    keyword!: string;

    page: number = 1;

    size: number = 10;

    sort: "createdAt" | "viewCount" = "createdAt";
  }

  export type SortKey = "reportedAt" | "reportCount";

  export type SearchTarget =
    | "post_title"
    | "post_summary"
    | "keyword"
    | "report_reason";

  export class GetListQueryDtoForAdmin {
    page: number = 1;

    size: number = 10;

    sort: SortKey = "reportedAt";

    searchTarget: SearchTarget = "post_title";

    searchValue?: string;
  }
}
