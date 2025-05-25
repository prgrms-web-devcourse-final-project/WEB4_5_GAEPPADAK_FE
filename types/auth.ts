export namespace IAuth {
  export class SignUpDto {
    email!: string;

    passwordHash!: string;

    nickname!: string;

    birthDate!: string;
  }

  export class SignInDto {
    email!: string;

    passwordHash!: string;
  }

  export interface SignUpResponse {
    code: string;

    message: string;

    data: {
      email: string;

      nickname: string;

      birthDate: string;

      role: string;
    };
  }

  export interface SignInResponse {
    code: string;

    message: string;

    data: {
      id: string;

      nickname: string;

      email: string;

      deleteAt: string | null;

      role: string;
    };
  }

  export class CheckEmailDto {
    email!: string;

    authCode!: string;
  }

  export class ResetPasswordDto {
    email!: string;

    newPassword!: string;
  }

  export class CheckPasswordDto {
    password!: string;
  }

  export class PatchProfileDto {
    nickname?: string;

    password?: string;
  }
}
