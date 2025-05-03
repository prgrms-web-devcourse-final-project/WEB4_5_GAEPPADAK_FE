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
}
