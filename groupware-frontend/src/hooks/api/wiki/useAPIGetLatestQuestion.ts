import { useQuery } from 'react-query';
import { QAQuestion } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getLatestQuestionURL } from 'src/utils/url/wiki.url';

const getLatestQuestion = async (): Promise<QAQuestion[]> => {
  const res = await axiosInstance.get(getLatestQuestionURL);
  return res.data;
};

export const useAPIGetLatestQuestion = () => {
  return useQuery<QAQuestion[], Error>('getLatestQuestion', getLatestQuestion);
};
