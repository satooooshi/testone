import {QueryKey, useQuery, UseQueryOptions} from 'react-query';
import {WikiType, RuleCategory, Wiki} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getWikiListURL} from '../../../utils/url/wiki.url';
import {wikiQueryRefresh} from '../../../utils/wikiQueryRefresh';

export interface SearchQueryToGetWiki {
  page?: string;
  word?: string;
  tag?: string;
  type?: WikiType;
  status?: 'new' | 'resolved';
  writer?: string;
  answer_writer?: string;
  rule_category?: RuleCategory;
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
  const response = await axiosInstance.get<SearchResultToGetWiki>(
    `${getWikiListURL}?${url}`,
  );
  return response.data;
};

export const useAPIGetWikiList = (
  query: SearchQueryToGetWiki,
  useQueryOptions?: Omit<
    UseQueryOptions<
      SearchResultToGetWiki,
      Error,
      SearchResultToGetWiki,
      QueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<SearchResultToGetWiki, Error>(
    ['QAs', query],
    () => getWikiList(query),
    useQueryOptions,
  );
};
