import {axiosInstance} from '../../../utils/url';
import {joinEventURL} from '../../../utils/url/event.url';
import {UseMutationOptions, useMutation} from 'react-query';

interface JoinEventRequest {
  eventID: number;
}

const joinEvent = async (body: JoinEventRequest) => {
  const res = await axiosInstance.post(joinEventURL, body);
  return res.data;
};

export const useAPIJoinEvent = (
  mutationOptions: UseMutationOptions<
    unknown,
    Error,
    JoinEventRequest,
    unknown
  >,
) => {
  return useMutation<unknown, Error, JoinEventRequest>(
    joinEvent,
    mutationOptions,
  );
};
