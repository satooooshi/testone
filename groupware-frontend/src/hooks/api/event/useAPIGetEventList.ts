import { useQuery } from 'react-query';
import { EventSchedule, EventType } from 'src/types';
import { generateEventSearchQueryString } from 'src/utils/eventQueryRefresh';
import { axiosInstance } from 'src/utils/url';
import { getEventURL } from 'src/utils/url/event.url';

export interface SearchQueryToGetEvents {
  page?: string;
  word?: string;
  tag?: string;
  status?: 'future' | 'past' | 'current';
  type?: EventType | '';
  from?: string;
  to?: string;
  participant_id?: string;
  host_user_id?: string;
}

export interface SearchResultToGetEvents {
  // this key is the total page count
  pageCount: number;
  events: EventSchedule[];
}

const getEventList = async (
  query: SearchQueryToGetEvents,
): Promise<SearchResultToGetEvents> => {
  const url = getEventURL + generateEventSearchQueryString(query);
  const response = await axiosInstance.get(url);
  return response.data;
};

export const useAPIGetEventList = (query: SearchQueryToGetEvents) => {
  return useQuery<SearchResultToGetEvents>(['events', query], () =>
    getEventList(query),
  );
};
