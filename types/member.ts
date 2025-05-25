export namespace IMember {
  export type roleType = "USER" | "ADMIN";

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
  }

  export class GetListQueryDtoForAdmin {
    page!: number;

    size!: number;

    searchTarget!: "email" | "nickname" | "role";

    searchValue!: string;
  }
}
