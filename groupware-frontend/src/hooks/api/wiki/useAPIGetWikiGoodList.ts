import { useQuery, UseQueryOptions } from 'react-query';
import { UserGoodForBoard } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getWikiGoodListURL } from 'src/utils/url/wiki.url';
import { AxiosError } from 'axios';

const getUserGoodList = async (userID: string): Promise<UserGoodForBoard[]> => {
  const response = await axiosInstance.get(`${getWikiGoodListURL}/${userID}`);
  return response.data;
};

export const useAPIGetUserGoodList = (userID: string) => {
  return useQuery(['userGoodList', userID], () => {
    return getUserGoodList(userID);
  });
};
