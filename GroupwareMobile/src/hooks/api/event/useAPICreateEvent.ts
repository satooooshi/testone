import {useMutation, UseMutationOptions} from 'react-query';
import {EventSchedule, EventVideo, EventFile} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createEventURL} from '../../../utils/url/event.url';

type ExcludeFilesAndVideos = Pick<
  EventSchedule,
  | 'title'
  | 'description'
  | 'startAt'
  | 'endAt'
  | 'tags'
  | 'imageURL'
  | 'type'
  | 'hostUsers'
  | 'chatNeeded'
>;

export type CreateEventRequest = ExcludeFilesAndVideos & {
  id?: number;
  videos: Partial<EventVideo>[];
  files: Partial<EventFile>[];
};

const createEvent = async (
  eventSchedule: CreateEventRequest,
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
    CreateEventRequest,
    unknown
  >,
) => {
  return useMutation<EventSchedule, Error, CreateEventRequest>(
    createEvent,
    mutationOptions,
  );
};
