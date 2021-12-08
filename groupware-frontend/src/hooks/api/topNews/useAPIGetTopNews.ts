import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { TopNews } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { topNewsUrl } from 'src/utils/url/topNews.url';

export type GetTopNewsQuery = {
  page?: string;
};
export type GetTopNewsResult = {
  pageCount?: number;
  news: TopNews[];
};
const getTopNews = (query: GetTopNewsQuery) => {
  const { page = 1 } = query;
  const res = await axiosInstance.get<GetTopNewsResult>(
    `${topNewsUrl}?page=${page}`,
  );
  return res.data;
};

export const useAPIGetTopNews = (query: GetTopNewsQuery) => {
  return useQuery<GetTopNewsResult, AxiosError>(['getTopNews', query], () =>
    getTopNews(query),
  );
};
