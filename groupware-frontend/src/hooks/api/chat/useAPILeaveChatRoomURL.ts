import { useMutation, UseMutationOptions } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { leaveChatRoomURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const leaveChatGroup = async (chatGroup: Partial<ChatGroup>) => {
  const response = await axiosInstance.post(leaveChatRoomURL, chatGroup, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPILeaveChatRoom = (
  mutationOptions?: UseMutationOptions<
    void,
    Error,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<void, Error, Partial<ChatGroup>>(
    leaveChatGroup,
    mutationOptions,
  );
};
