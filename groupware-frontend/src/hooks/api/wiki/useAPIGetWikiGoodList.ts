import { useQuery, UseQueryOptions } from 'react-query';
import { BoardCategory, RuleCategory, Wiki, WikiType, User } from 'src/types';
import { wikiQueryRefresh } from 'src/utils/wikiQueryRefresh';
import { axiosInstance } from 'src/utils/url';
import { getWikiGoodListURL } from 'src/utils/url/wiki.url';
import { AxiosError } from 'axios';

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

export interface SearchResultToGetWiki {
  // this key is the total page count
  pageCount: number;
  wiki: Wiki[];
}

const getUserGoodList = async (
  query: SearchQueryToGetWiki,
): Promise<SearchResultToGetWiki> => {
  const url = wikiQueryRefresh(query);
  const response = await axiosInstance.get(`${getWikiGoodListURL}?${url}`);
  return response.data;
};

export const useAPIGetUserGoodList = (
  query: SearchQueryToGetWiki,
  options?: UseQueryOptions<SearchResultToGetWiki, AxiosError>,
) => {
  return useQuery<SearchResultToGetWiki, AxiosError>(
    ['QAs', query],
    () => getUserGoodList(query),
    options,
  );
};
