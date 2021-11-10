import {useMutation, UseMutationOptions} from 'react-query';
import {EventSchedule} from '../../../types';
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
    Error,
    Partial<EventSchedule>,
    unknown
  >,
) => {
  return useMutation<EventSchedule, Error, Partial<EventSchedule>>(
    createEvent,
    mutationOptions,
  );
};
