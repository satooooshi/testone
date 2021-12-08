import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {TopNews} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {topNewsUrl} from '../../../utils/url/topNews.url';

export type GetTopNewsQuery = {
  page?: string;
};
export type GetTopNewsResult = {
  pageCount?: number;
  news: TopNews[];
};
const getTopNews = async (query: GetTopNewsQuery) => {
  const {page = 1} = query;
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
