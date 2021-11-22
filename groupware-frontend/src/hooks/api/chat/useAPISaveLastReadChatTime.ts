import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { LastReadChatTime } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveLastReadChatTimeURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const saveLastReadChatTime = async (
  chatGroupId: number,
): Promise<LastReadChatTime> => {
  const response = await axiosInstance.patch(
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
