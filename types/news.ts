import { IPagination } from "./common";

export namespace INews {
  export interface ISummary {
    newsId: number;

    url: string;

    title: string;

    thumbnailUrl: string;

    publishedAt: string;

    platform: string;

    summary: string;
  }

  export namespace ISource {
    export interface ISummary {
      sourceId: number;

      url: string;

      thumbnailUrl: string;

      title: string;

      platform: "YOUTUBE" | "NAVER_NEWS";

      source: string;
    }

    export interface ISummaryForPost {
      sourceId: number;

      url: string;

      thumbnailUrl: string;

      title: string;
    }

    export class GetMixedListQueryDto {
      keyword!: string;

      page: number = 1;

      size: number = 10;
    }
  }

  export class GetListQueryDto extends IPagination.OffsetQueryDto {}
}
