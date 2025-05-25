export namespace IMember {
  export type roleType = "USER" | "ADMIN";

  export interface Me {
    nickname: string;

    email: string;

    birthDate: string;

    role: roleType;
  }
}
