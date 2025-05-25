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
}
