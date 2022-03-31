import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { leaveChatRoomURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const deleteChatGroup = async (chatGroup: Partial<ChatGroup>) => {
  const response = await axiosInstance.post(leaveChatRoomURL, chatGroup, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPIDeleteChatRoom = (
  mutationOptions?: UseMutationOptions<
    void,
    AxiosError,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<void, AxiosError, Partial<ChatGroup>>(
    deleteChatGroup,
    mutationOptions,
  );
};
