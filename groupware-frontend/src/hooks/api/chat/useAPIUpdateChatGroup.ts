import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveChatGroupURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const updateChatGroup = async (chatGroup: ChatGroup): Promise<ChatGroup> => {
  const response = await axiosInstance.patch<ChatGroup>(
    saveChatGroupURL,
    chatGroup,
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPIUpdateChatGroup = (
  mutationOptions?: UseMutationOptions<
    ChatGroup,
    AxiosError,
    ChatGroup,
    unknown
  >,
) => {
  return useMutation<ChatGroup, AxiosError, ChatGroup>(
    updateChatGroup,
    mutationOptions,
  );
};
