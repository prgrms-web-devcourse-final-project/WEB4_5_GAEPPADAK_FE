import { AxiosResponse } from "axios";
import { ApiResponse, IPagination, IPost } from "../../types";
import { axiosInstance } from "./axios.instance";

class PostService {
  async getTop10Summary() {
    try {
      const response =
        await axiosInstance.get<ApiResponse<IPost.ISummary[]>>(
          `api/v1/posts/top`
        );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDetail(postId: number) {
    try {
      const response = await axiosInstance.get<ApiResponse<IPost>>(
        `api/v1/posts/${postId}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getList(query: IPost.GetListQueryDto) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<IPost.ISummary[]>>
      >(`/api/v1/posts/search`, {
        params: query,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async reportPost(postId: number, reportDto: IPost.ReportDto) {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        `/api/v2/reports/posts/${postId}`,
        reportDto
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getReportedPosts(query: IPost.GetListQueryDtoForAdmin) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<IPost.ISummaryForAdmin[]>>
      >(`/api/v2/admin/reports/posts`, {
        params: query,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async approveReport(postIds: number[]) {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        `/api/v2/admin/reports/posts`,
        {
          postIds,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async rejectReport(postIds: number[]) {
    try {
      const response = await axiosInstance.request<ApiResponse<void>>({
        method: "DELETE",
        url: `/api/v2/admin/reports/posts`,
        data: {
          postIds,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const postService = new PostService();
