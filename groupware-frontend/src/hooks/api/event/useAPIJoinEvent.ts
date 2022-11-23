import { AxiosError } from 'axios';
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
    AxiosError,
    JoinEventRequest,
    unknown
  >,
) => {
  return useMutation<unknown, AxiosError, JoinEventRequest>(
    joinEvent,
    mutationOptions,
  );
};
