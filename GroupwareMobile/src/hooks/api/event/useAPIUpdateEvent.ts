import {EventSchedule} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {updateEventURL} from '../../../utils/url/event.url';
import {UseMutationOptions, useMutation} from 'react-query';

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
    Error,
    Partial<EventSchedule>,
    unknown
  >,
) => {
  return useMutation<EventSchedule, Error, Partial<EventSchedule>>(
    updateEvent,
    mutationOptions,
  );
};
