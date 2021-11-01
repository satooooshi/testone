import {useMutation, UseMutationOptions} from 'react-query';
import {EventSchedule} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {deleteEventURL} from '../../../utils/url/event.url';

interface deleteEventRequest {
  eventId: number;
}

const apiDeleteEvent = async (
  body: deleteEventRequest,
): Promise<EventSchedule> => {
  const res = await axiosInstance.post<EventSchedule>(deleteEventURL, body, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIDeleteEvent = (
  mutationOptions?: UseMutationOptions<
    EventSchedule,
    Error,
    deleteEventRequest,
    unknown
  >,
) => {
  return useMutation<EventSchedule, Error, deleteEventRequest>(
    apiDeleteEvent,
    mutationOptions,
  );
};
