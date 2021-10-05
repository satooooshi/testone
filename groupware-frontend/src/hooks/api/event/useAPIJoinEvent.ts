import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { joinEventURL } from 'src/utils/url/event.url';

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
