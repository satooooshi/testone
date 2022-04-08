import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { EventSchedule } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteEventURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

interface deleteEventRequest {
  eventId: number;
}

const apiDeleteEvent = async (
  body: deleteEventRequest,
): Promise<EventSchedule> => {
  const res = await axiosInstance.post(deleteEventURL, body, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIDeleteEvent = (
  mutationOptions?: UseMutationOptions<
    EventSchedule,
    AxiosError,
    deleteEventRequest,
    unknown
  >,
) => {
  return useMutation<EventSchedule, AxiosError, deleteEventRequest>(
    apiDeleteEvent,
    mutationOptions,
  );
};
