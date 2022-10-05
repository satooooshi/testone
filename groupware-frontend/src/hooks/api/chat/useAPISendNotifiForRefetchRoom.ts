import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { LastReadChatTime } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { sendNotifiForRefetchRoomURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const sendNotifiForRefetchRoom = async (chatGroupId: number): Promise<void> => {
  const response = await axiosInstance.post(
    sendNotifiForRefetchRoomURL + '/' + chatGroupId,
    null,
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPISendNotifiForRefetchRoom = (
  mutationOptions?: UseMutationOptions<void, AxiosError, number, unknown>,
) => {
  return useMutation<void, AxiosError, number>(
    sendNotifiForRefetchRoom,
    mutationOptions,
  );
};
