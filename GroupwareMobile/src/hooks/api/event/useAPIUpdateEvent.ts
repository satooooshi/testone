import {EventSchedule} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {updateEventURL} from '../../../utils/url/event.url';
import {UseMutationOptions, useMutation} from 'react-query';
import {AxiosError} from 'axios';
import {ValidateErrorResponseByServer} from '../../../utils/factory/responseEroorMsgFactory';

const updateEvent = async (
  eventSchedule: Partial<EventSchedule>,
): Promise<EventSchedule> => {
  const res = await axiosInstance.post<EventSchedule>(
    updateEventURL,
    eventSchedule,
    {
      headers: jsonHeader,
    },
  );
  return res.data;
};

export const useAPIUpdateEvent = (
  mutationOptions?: UseMutationOptions<
    EventSchedule,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<EventSchedule>,
    unknown
  >,
) => {
  return useMutation<
    EventSchedule,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<EventSchedule>
  >(updateEvent, mutationOptions);
};
