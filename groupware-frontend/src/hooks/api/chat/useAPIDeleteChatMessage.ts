import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatMessage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteChantMessageURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const deleteChatMessage = async (message: ChatMessage) => {
  await axiosInstance.post(deleteChantMessageURL, message, {
    headers: jsonHeader,
  });
};

export const useAPIDeleteChatMessage = (
  mutationOptions?: UseMutationOptions<
    unknown,
    AxiosError,
    ChatMessage,
    unknown
  >,
) => {
  return useMutation<unknown, AxiosError, ChatMessage, unknown>(
    deleteChatMessage,
    mutationOptions,
  );
};
