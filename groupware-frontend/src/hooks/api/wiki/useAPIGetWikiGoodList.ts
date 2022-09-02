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

const getUserGoodList = async (
  userID: string,
): Promise<SearchResultToGetWikiGoodList> => {
  const response = await axiosInstance.get(`${getWikiGoodListURL}/${userID}`);
  return response.data;
};

export const useAPIGetUserGoodList = (userID: string) => {
  return useQuery(['QAs', userID], () => {
    return getUserGoodList(userID);
  });
};
