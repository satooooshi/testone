import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {saveChatGroupURL} from '../../../utils/url/chat.url';

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
