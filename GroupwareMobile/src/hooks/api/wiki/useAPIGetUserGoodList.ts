import {AxiosError} from 'axios';
import {QueryKey, useQuery, UseQueryOptions} from 'react-query';
import {
  WikiType,
  RuleCategory,
  BoardCategory,
  UserGoodForBoard,
} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getWikiGoodListURL} from '../../../utils/url/wiki.url';

export interface SearchQueryToGetWiki {
  page?: string;
  word?: string;
  tag?: string;
  type?: WikiType;
  status?: 'new' | 'resolved';
  writer?: string;
  answer_writer?: string;
  rule_category?: RuleCategory;
  board_category?: BoardCategory;
}

const getUserGoodList = async (userID: string): Promise<UserGoodForBoard[]> => {
  const response = await axiosInstance.get<UserGoodForBoard[]>(
    `${getWikiGoodListURL}/${userID}`,
  );
  return response.data;
};

export const useAPIGetUserGoodList = (
  userID: string,
  useQueryOptions?: Omit<
    UseQueryOptions<
      UserGoodForBoard[],
      AxiosError,
      UserGoodForBoard[],
      QueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<UserGoodForBoard[], AxiosError>(
    ['userGoodList', userID],
    () => getUserGoodList(userID),
    useQueryOptions,
  );
};
