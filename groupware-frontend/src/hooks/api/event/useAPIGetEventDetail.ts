import { useQuery } from 'react-query';
import { EventSchedule } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getEventDetailURL } from 'src/utils/url/event.url';

export type GetEventDetailResponse = Required<EventSchedule> & {
  isJoining: boolean;
};

const getEventDetail = async (id: string) => {
  const res = await axiosInstance.get(`${getEventDetailURL}/${id}`);
  return res.data;
};

export const useAPIGetEventDetail = (id: string) => {
  return useQuery<GetEventDetailResponse, Error>(
    ['getEventDetail', { id }],
    () => getEventDetail(id),
  );
};
