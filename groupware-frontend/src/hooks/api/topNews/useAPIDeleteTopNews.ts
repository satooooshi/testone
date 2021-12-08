import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { AxiosError } from 'axios';
import { topNewsUrl } from 'src/utils/url/topNews.url';

const updateNews = async (newsId: number): Promise<number> => {
  const res = await axiosInstance.delete<number>(`${topNewsUrl}/${newsId}`);
  return res.data;
};

export const useAPICreateNews = (
  mutationOptions?: UseMutationOptions<number, AxiosError, number, unknown>,
) => {
  return useMutation<number, AxiosError, number>(updateNews, mutationOptions);
};
