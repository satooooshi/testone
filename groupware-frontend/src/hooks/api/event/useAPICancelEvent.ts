import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { cancelEventURL } from 'src/utils/url/event.url';

interface CancelEventRequest {
  eventID: number;
}

const CancelEvent = async (body: CancelEventRequest) => {
  const res = await axiosInstance.patch(cancelEventURL + '/' + body.eventID);
  return res.data;
};

export const useAPICancelEvent = (
  mutationOptions: UseMutationOptions<
    unknown,
    AxiosError,
    CancelEventRequest,
    unknown
  >,
) => {
  return useMutation<unknown, AxiosError, CancelEventRequest>(
    CancelEvent,
    mutationOptions,
  );
};
