import { ApiResponse, IPagination } from "@/types";
import { axiosInstance } from "./axios.instance";
import { IComment } from "@/types/comment";
import { AxiosResponse } from "axios";

export class CommentService {
  async getComments(postId: number, query: IComment.GetListQueryDto) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<IComment[]>>
      >(`/api/v1/posts/${postId}/comments`, { params: query });
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createComment(postId: number, body: string) {
    try {
      const response = await axiosInstance.post<
        ApiResponse<IComment>,
        AxiosResponse<ApiResponse<IComment>>,
        IComment.CreateDto
      >(`/api/v1/posts/${postId}/comments`, { body });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateComment(commentId: number, body: string) {
    try {
      const response = await axiosInstance.patch<
        ApiResponse<IComment>,
        AxiosResponse<ApiResponse<IComment>>,
        IComment.UpdateDto
      >(`/api/v1/comments/${commentId}`, { body });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteComment(commentId: number) {
    try {
      await axiosInstance.delete<ApiResponse<void>>(
        `/api/v1/comments/${commentId}`
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async likeComment(commentId: number) {
    try {
      const response = await axiosInstance.post<ApiResponse<IComment.ILike>>(
        `/api/v1/comments/${commentId}/like`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async unlikeComment(commentId: number) {
    try {
      await axiosInstance.delete<ApiResponse<void>>(
        `/api/v1/comments/${commentId}/like`
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async reportComment(
    commentId: number,
    reportDto: IComment.ReportDto
  ): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.post<
        ApiResponse<void>,
        AxiosResponse<ApiResponse<void>>,
        IComment.ReportDto
      >(`/api/v2/reports/comments/${commentId}`, reportDto);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getReportedComments(query: IComment.GetListQueryDtoForAdmin) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<IComment.ISummaryForAdmin[]>>
      >(`/api/v2/admin/reports/comments`, { params: query });
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async approveReport(commentIds: number[]) {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        `/api/v2/admin/reports/comments`,
        { commentIds }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async rejectReport(commentIds: number[]) {
    try {
      const response = await axiosInstance.request<ApiResponse<void>>({
        method: "DELETE",
        url: `/api/v2/admin/reports/comments`,
        data: {
          commentIds,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const commentService = new CommentService();
