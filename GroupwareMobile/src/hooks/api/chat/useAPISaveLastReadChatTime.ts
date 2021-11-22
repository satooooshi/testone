import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {LastReadChatTime} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {saveLastReadChatTimeURL} from '../../../utils/url/chat.url';

const saveLastReadChatTime = async (
  chatGroupId: number,
): Promise<LastReadChatTime> => {
  const response = await axiosInstance.patch<LastReadChatTime>(
    saveLastReadChatTimeURL + '/' + chatGroupId,
    null,
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPISaveLastReadChatTime = (
  mutationOptions?: UseMutationOptions<
    LastReadChatTime,
    AxiosError,
    number,
    unknown
  >,
) => {
  return useMutation<LastReadChatTime, AxiosError, number>(
    saveLastReadChatTime,
    mutationOptions,
  );
};
