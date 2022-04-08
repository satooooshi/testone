import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {QABestAnswer} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getBestAnswerURL} from '../../../utils/url/wiki.url';

const getBestAnswer = async (id: string): Promise<QABestAnswer> => {
  const res = await axiosInstance.post<QABestAnswer>(getBestAnswerURL, {
    id: id,
  });
  return res.data;
};

export const useAPIGetBestAnswer = (id: string) => {
  return useQuery<QABestAnswer, AxiosError>('getBestAnswer', () =>
    getBestAnswer(id),
  );
};
