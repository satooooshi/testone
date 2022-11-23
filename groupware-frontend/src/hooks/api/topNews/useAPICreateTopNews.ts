import { useMutation, UseMutationOptions } from 'react-query';
import { TopNews } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { AxiosError } from 'axios';
import { topNewsUrl } from 'src/utils/url/topNews.url';

const createNews = async (news: Partial<TopNews>): Promise<TopNews> => {
  const res = await axiosInstance.post(topNewsUrl, news);
  return res.data;
};

export const useAPICreateNews = (
  mutationOptions?: UseMutationOptions<
    TopNews,
    AxiosError,
    Partial<TopNews>,
    unknown
  >,
) => {
  return useMutation<TopNews, AxiosError, Partial<TopNews>>(
    createNews,
    mutationOptions,
  );
};
