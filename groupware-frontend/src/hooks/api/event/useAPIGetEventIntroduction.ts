import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { EventIntroduction, EventType } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getEventIntroductionURL } from 'src/utils/url/event.url';

export type GetEventIntroductionResponse = Required<EventIntroduction>;

const getEventIntroduction = async (type: EventType) => {
  const res = await axiosInstance.get(`${getEventIntroductionURL}/${type}`);
  return res.data;
};

export const useAPIGetEventIntroduction = (type: EventType) => {
  return useQuery<GetEventIntroductionResponse, AxiosError>(
    ['getEventIntroduction', { type }],
    () => getEventIntroduction(type),
  );
};
