import { useQuery } from 'react-query';
import { EventSchedule } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getLatestEventURL } from 'src/utils/url/event.url';
import { SearchQueryToGetEvents } from './useAPIGetEventList';

type SearchQueryToGetLatestEvents = Pick<SearchQueryToGetEvents, 'type'>;

const getLatestEvent = async (
  query?: SearchQueryToGetLatestEvents,
): Promise<EventSchedule[]> => {
  const res = await axiosInstance.get(
    `${getLatestEventURL}?type=${query?.type || ''}`,
  );
  return res.data;
};

export const useAPIGetLatestEvent = (query?: SearchQueryToGetLatestEvents) => {
  return useQuery<EventSchedule[], Error>('getLatestEvent', () =>
    getLatestEvent(query),
  );
};
