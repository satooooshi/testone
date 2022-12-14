import { CreateEventRequest } from '@/components/event/CreateEventModal';
import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { EventSchedule } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { createEventURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

const createEvent = async (
  eventSchedule: CreateEventRequest,
): Promise<EventSchedule> => {
  const res = await axiosInstance.post(createEventURL, eventSchedule, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPICreateEvent = (
  mutationOptions?: UseMutationOptions<
    EventSchedule,
    AxiosError,
    CreateEventRequest,
    unknown
  >,
) => {
  return useMutation<EventSchedule, AxiosError, CreateEventRequest>(
    createEvent,
    mutationOptions,
  );
};
