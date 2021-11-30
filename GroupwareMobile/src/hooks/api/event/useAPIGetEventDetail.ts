import {EventSchedule} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getEventDetailURL} from '../../../utils/url/event.url';
import {useQuery} from 'react-query';
import {AxiosError} from 'axios';

export type GetEventDetailResponse = Required<EventSchedule> & {
  isJoining: boolean;
  isCanceled: boolean;
};

const getEventDetail = async (id: number) => {
  const res = await axiosInstance.get<GetEventDetailResponse>(
    `${getEventDetailURL}/${id}`,
  );
  return res.data;
};

export const useAPIGetEventDetail = (id: number) => {
  return useQuery<GetEventDetailResponse, AxiosError>(
    ['getEventDetail', {id}],
    () => getEventDetail(id),
  );
};
