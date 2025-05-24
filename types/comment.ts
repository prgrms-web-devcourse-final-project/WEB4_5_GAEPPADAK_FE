export interface IComment {
  commentId: number;

  memberId: string;

  nickname: string;

  body: string;

  likeCount: number;

  createdAt: string;

  profileUrl: string;
}

export namespace IComment {
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
}
