import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { EventSchedule } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getEventURL } from 'src/utils/url/event.url';

type Status = 'day' | 'week' | 'month';

export interface SearchResultToGetEvents {
  // this key is the total page count
  pageCount: number;
  events: EventSchedule[];
}

const getDurationEvent = async (status: Status): Promise<EventSchedule[]> => {
  const response = await axiosInstance.get(`${getEventURL}?status=${status}`);
  return response.data;
};

export const useAPIDurationEvent = (status: Status) => {
  return useQuery<SearchResultToGetEvents | EventSchedule[], AxiosError>(
    ['events', status],
    () => getDurationEvent(status),
  );
};
