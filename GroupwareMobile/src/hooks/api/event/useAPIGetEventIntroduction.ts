import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {EventType, EventIntroduction} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getEventIntroductionURL} from '../../../utils/url/event.url';

export type GetEventIntroductionResponse = Required<EventIntroduction>;

const getEventIntroduction = async (type: EventType) => {
  const res = await axiosInstance.get<GetEventIntroductionResponse>(
    `${getEventIntroductionURL}/${type}`,
  );
  return res.data;
};

export const useAPIGetEventIntroduction = (type: EventType) => {
  return useQuery<GetEventIntroductionResponse, AxiosError>(
    ['getEventIntroduction', {type}],
    () => getEventIntroduction(type),
  );
};
