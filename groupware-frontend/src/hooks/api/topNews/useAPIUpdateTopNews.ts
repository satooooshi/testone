import { useMutation, UseMutationOptions } from 'react-query';
import { TopNews } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { AxiosError } from 'axios';
import { topNewsUrl } from 'src/utils/url/topNews.url';

const updateNews = async (news: TopNews): Promise<TopNews> => {
  const res = await axiosInstance.patch(topNewsUrl, news);
  return res.data;
};

export const useAPICreateNews = (
  mutationOptions?: UseMutationOptions<TopNews, AxiosError, TopNews, unknown>,
) => {
  return useMutation<TopNews, AxiosError, TopNews>(updateNews, mutationOptions);
};
