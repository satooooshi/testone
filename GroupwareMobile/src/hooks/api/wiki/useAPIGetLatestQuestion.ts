import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {Wiki} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getLatestWikiURL} from '../../../utils/url/wiki.url';

const getLatestQuestion = async (): Promise<Wiki[]> => {
  const res = await axiosInstance.get<Wiki[]>(getLatestWikiURL);
  return res.data;
};

export const useAPIGetLatestQuestion = () => {
  return useQuery<Wiki[], AxiosError>('getLatestQuestion', getLatestQuestion);
};
