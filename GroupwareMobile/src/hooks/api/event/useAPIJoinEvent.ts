import {axiosInstance} from '../../../utils/url';
import {joinEventURL} from '../../../utils/url/event.url';
import {UseMutationOptions, useMutation} from 'react-query';
import {AxiosError} from 'axios';

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
