import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {cancelEventURL} from '../../../utils/url/event.url';

interface CancelEventRequest {
  eventID: number;
}

const CancelEvent = async (body: CancelEventRequest) => {
  const res = await axiosInstance.patch<CancelEventRequest>(
    cancelEventURL + '/' + body.eventID,
  );
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
