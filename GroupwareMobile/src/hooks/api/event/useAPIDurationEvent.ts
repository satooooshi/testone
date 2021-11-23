import {EventSchedule} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getEventURL} from '../../../utils/url/event.url';
import {useQuery} from 'react-query';
import {AxiosError} from 'axios';

type Status = 'day' | 'week' | 'month';

export interface SearchResultToGetEvents {
  // this key is the total page count
  pageCount: number;
  events: EventSchedule[];
}

const getDurationEvent = async (status: Status) => {
  const response = await axiosInstance.get<
    SearchResultToGetEvents | EventSchedule[]
  >(`${getEventURL}?status=${status}`);
  return response.data;
};

export const useAPIDurationEvent = (status: Status) => {
  return useQuery<SearchResultToGetEvents | EventSchedule[], AxiosError>(
    ['events', status],
    () => getDurationEvent(status),
  );
};
