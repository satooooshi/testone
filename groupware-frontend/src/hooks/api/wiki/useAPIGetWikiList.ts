import { useQuery, UseQueryOptions } from 'react-query';
import { BoardCategory, RuleCategory, Wiki, WikiType } from 'src/types';
import { wikiQueryRefresh } from 'src/utils/wikiQueryRefresh';
import { axiosInstance } from 'src/utils/url';
import { getWikiListURL } from 'src/utils/url/wiki.url';
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

const getWikiList = async (
  query: SearchQueryToGetWiki,
): Promise<SearchResultToGetWiki> => {
  const url = wikiQueryRefresh(query);
  const response = await axiosInstance.get(`${getWikiListURL}?${url}`);
  return response.data;
};

export const useAPIGetWikiList = (
  query: SearchQueryToGetWiki,
  options?: UseQueryOptions<SearchResultToGetWiki, AxiosError>,
) => {
  return useQuery<SearchResultToGetWiki, AxiosError>(
    ['QAs', query],
    () => getWikiList(query),
    options,
  );
};
