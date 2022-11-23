import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { Wiki } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getLatestWikiURL } from 'src/utils/url/wiki.url';

const getLatestQuestion = async (): Promise<Wiki[]> => {
  const res = await axiosInstance.get(getLatestWikiURL);
  return res.data;
};

export const useAPIGetLatestQuestion = () => {
  return useQuery<Wiki[], AxiosError>('getLatestQuestion', getLatestQuestion);
};
