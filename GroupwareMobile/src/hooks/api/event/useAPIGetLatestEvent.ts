import {SearchQueryToGetEvents} from './useAPIGetEventList';
import {EventSchedule} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getLatestEventURL} from '../../../utils/url/event.url';
import {useQuery} from 'react-query';
import {AxiosError} from 'axios';

type SearchQueryToGetLatestEvents = Pick<SearchQueryToGetEvents, 'type'>;

const getLatestEvent = async (
  query?: SearchQueryToGetLatestEvents,
): Promise<EventSchedule[]> => {
  const res = await axiosInstance.get<EventSchedule[]>(
    `${getLatestEventURL}?type=${query?.type || ''}`,
  );
  return res.data;
};

export const useAPIGetLatestEvent = (query?: SearchQueryToGetLatestEvents) => {
  return useQuery<EventSchedule[], AxiosError>('getLatestEvent', () =>
    getLatestEvent(query),
  );
};
