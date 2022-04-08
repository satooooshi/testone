import { CreateEventRequest } from '@/components/event/CreateEventModal';
import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { EventSchedule } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { updateEventURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

const updateEvent = async (
  eventSchedule: CreateEventRequest,
): Promise<EventSchedule> => {
  const res = await axiosInstance.post(updateEventURL, eventSchedule, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIUpdateEvent = (
  mutationOptions?: UseMutationOptions<
    EventSchedule,
    AxiosError,
    CreateEventRequest,
    unknown
  >,
) => {
  return useMutation<EventSchedule, AxiosError, CreateEventRequest>(
    updateEvent,
    mutationOptions,
  );
};
