import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {UserGoodForBoard} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getWikiGoodListURL} from '../../../utils/url/wiki.url';

const getUserGoodList = async (userID: string): Promise<UserGoodForBoard[]> => {
  const response = await axiosInstance.get<UserGoodForBoard[]>(
    `${getWikiGoodListURL}/${userID}`,
  );
  return response.data;
};

export const useAPIGetUserGoodList = (
  userID: string,
  useQueryOptions?: UseQueryOptions<UserGoodForBoard[], AxiosError>,
) => {
  return useQuery<UserGoodForBoard[], AxiosError>(
    ['userGoodList', userID],
    () => getUserGoodList(userID),
    useQueryOptions,
  );
};
