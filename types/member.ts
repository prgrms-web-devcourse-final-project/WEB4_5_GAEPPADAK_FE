export namespace IMember {
  export type roleType = "USER" | "ADMIN";

  export type blockType = "USER" | "BLACK";

  export interface IBase {
    email: string;

    role: roleType;
  }

  export interface Me extends IBase {
    nickname: string;

    birthDate: string;
  }

  export interface ISummaryForAdmin extends IBase {
    memberId: string;

    nickname: string;

    blockType?: blockType;
  }

  export class GetListQueryDtoForAdmin {
    page!: number;

    size!: number;

    searchTarget!: "email" | "nickname" | "role";

    searchValue!: string;
  }
}
