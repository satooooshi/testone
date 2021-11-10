import {EventSchedule} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getEventDetailURL} from '../../../utils/url/event.url';
import {useQuery} from 'react-query';

export type GetEventDetailResponse = Required<EventSchedule> & {
  isJoining: boolean;
};

const getEventDetail = async (id: number) => {
  const res = await axiosInstance.get<GetEventDetailResponse>(
    `${getEventDetailURL}/${id}`,
  );
  return res.data;
};

export const useAPIGetEventDetail = (id: number) => {
  return useQuery<GetEventDetailResponse, Error>(['getEventDetail', {id}], () =>
    getEventDetail(id),
  );
};
