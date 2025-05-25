import { ApiResponse, IMember, IPagination } from "../../types";
import { axiosInstance } from "./axios.instance";

class MemberService {
  async getMe(): Promise<ApiResponse<IMember.Me>> {
    try {
      const response =
        await axiosInstance.get<ApiResponse<IMember.Me>>("api/v1/members/me");
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getMemberList(query: IMember.GetListQueryDtoForAdmin) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<IMember.ISummaryForAdmin[]>>
      >(`/api/v2/admin/members`, { params: query });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const memberService = new MemberService();
