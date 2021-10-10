import { useQuery } from 'react-query';
import { Wiki } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getLatestQuestionURL } from 'src/utils/url/wiki.url';

const getLatestQuestion = async (): Promise<Wiki[]> => {
  const res = await axiosInstance.get(getLatestQuestionURL);
  return res.data;
};

export const useAPIGetLatestQuestion = () => {
  return useQuery<Wiki[], Error>('getLatestQuestion', getLatestQuestion);
};
