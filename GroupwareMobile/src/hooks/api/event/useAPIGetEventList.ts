import {EventType, EventSchedule} from '../../../types';
import {getEventURL} from '../../../utils/url/event.url';
import {generateEventSearchQueryString} from '../../../utils/eventQueryRefresh';
import {axiosInstance} from '../../../utils/url';
import {useQuery, UseQueryOptions} from 'react-query';
import {AxiosError} from 'axios';

export type EventStatus = 'future' | 'past' | 'current';

export interface SearchQueryToGetEvents {
  page?: string;
  word?: string;
  tag?: string;
  status?: EventStatus;
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
  const response = await axiosInstance.get<SearchResultToGetEvents>(url);
  return response.data;
};

export const useAPIGetEventList = (
  query: SearchQueryToGetEvents,
  useQueryOptions?: UseQueryOptions<SearchResultToGetEvents, AxiosError>,
) => {
  return useQuery<SearchResultToGetEvents, AxiosError>(
    ['events', query],
    () => getEventList(query),
    useQueryOptions,
  );
};
