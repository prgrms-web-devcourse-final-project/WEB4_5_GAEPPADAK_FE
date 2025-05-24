import { ApiResponse, INews, IPagination } from "../../types";
import { axiosInstance } from "./axios.instance";

class NewsService {
  async getTop10Summary() {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<IPagination.IOffset<INews.ISummary[]>>
        >(`api/v1/news/top`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPopularNews(query: INews.GetListQueryDto) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<INews.ISummary[]>>
      >("/api/v1/news/top", {
        params: query,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSourceNews(postId: number) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<INews.ISource.ISummaryForPost[]>>
      >(`/api/v1/posts/${postId}/news`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSourceNewsList(query: INews.ISource.GetMixedListQueryDto) {
    try {
      const response = await axiosInstance.get<
        ApiResponse<IPagination.IOffset<INews.ISource.ISummary[]>>
      >(`/api/v1/posts/search/sources`, { params: query });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const newsService = new NewsService();
