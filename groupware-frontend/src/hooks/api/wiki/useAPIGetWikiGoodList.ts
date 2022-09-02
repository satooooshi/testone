import { useQuery, UseQueryOptions } from 'react-query';
import { UserGoodForBoard } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getWikiGoodListURL } from 'src/utils/url/wiki.url';
import { AxiosError } from 'axios';

export interface SearchResultToGetWikiGoodList {
  // this key is the total page count
  pageCount: number;
  userGoodForBoard: UserGoodForBoard[];
}

const getUserGoodList = async (): Promise<SearchResultToGetWikiGoodList> => {
  const response = await axiosInstance.get(`${getWikiGoodListURL}`);
  return response.data;
};

export const useAPIGetUserGoodList = () => {
  return useQuery(['QAs'], () => {
    return getUserGoodList();
  });
};
