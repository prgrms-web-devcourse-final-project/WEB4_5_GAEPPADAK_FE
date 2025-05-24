import { ApiResponse, IAuth } from "../../types";
import { axiosInstance } from "./axios.instance";
import { AxiosResponse } from "axios";

class AuthService {
  async signup(signupDto: IAuth.SignUpDto): Promise<IAuth.SignUpResponse> {
    const response = await axiosInstance.post<IAuth.SignUpResponse>(
      "api/v1/members/signup",
      signupDto
    );
    try {
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async signin(signinDto: IAuth.SignInDto): Promise<IAuth.SignInResponse> {
    const response = await axiosInstance.post<IAuth.SignInResponse>(
      "api/v1/auth/login",
      signinDto
    );
    try {
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async signout(): Promise<void> {
    try {
      await axiosInstance.post<void>("api/v1/auth/logout");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      await axiosInstance.post<void>("api/v1/auth/refresh");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sendEmailAuth(email: string): Promise<void> {
    try {
      await axiosInstance.post<ApiResponse<void>>(
        "api/v1/auth/verify-email",
        null,
        {
          params: { email },
        }
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async checkEmail(body: IAuth.CheckEmailDto): Promise<void> {
    try {
      await axiosInstance.post<
        ApiResponse<void>,
        AxiosResponse<ApiResponse<void>>,
        IAuth.CheckEmailDto
      >("api/v1/auth/check-email", body);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async resetPassword(body: IAuth.ResetPasswordDto): Promise<void> {
    try {
      await axiosInstance.patch<ApiResponse<void>>(
        "api/v1/member/password",
        body
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

export const authService = new AuthService();
