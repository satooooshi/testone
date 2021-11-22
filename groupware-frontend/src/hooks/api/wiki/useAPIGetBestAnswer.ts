import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { QABestAnswer } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getBestAnswerURL } from 'src/utils/url/wiki.url';

const getBestAnswer = async (id: string): Promise<QABestAnswer> => {
  const res = await axiosInstance.post(getBestAnswerURL, { id: id });
  return res.data;
};

export const useAPIGetBestAnswer = (id: string) => {
  return useQuery<QABestAnswer, AxiosError>('getBestAnswer', () =>
    getBestAnswer(id),
  );
};
