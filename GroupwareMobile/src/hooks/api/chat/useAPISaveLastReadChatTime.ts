import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {LastReadChatTime} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {saveLastReadChatTimeURL} from '../../../utils/url/chat.url';

const saveLastReadChatTime = async (
  chatGroupId: number,
): Promise<LastReadChatTime> => {
  const response = await axiosInstance.patch<LastReadChatTime>(
    saveLastReadChatTimeURL + '/' + chatGroupId,
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
