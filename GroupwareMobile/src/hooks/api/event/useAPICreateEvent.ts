import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {EventSchedule} from '../../../types';
import {ValidateErrorResponseByServer} from '../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createEventURL} from '../../../utils/url/event.url';

const createEvent = async (
  eventSchedule: Partial<EventSchedule>,
): Promise<EventSchedule> => {
  const res = await axiosInstance.post<EventSchedule>(
    createEventURL,
    eventSchedule,
    {
      headers: jsonHeader,
    },
  );
  return res.data;
};

export const useAPICreateEvent = (
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
  >(createEvent, mutationOptions);
};
