import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatMessage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteChantMessageURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const deleteChatMessage = async (
  message: ChatMessage,
): Promise<ChatMessage> => {
  const response = await axiosInstance.post(deleteChantMessageURL, message, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPIDeleteChatMessage = (
  mutationOptions?: UseMutationOptions<
    ChatMessage,
    AxiosError,
    ChatMessage,
    unknown
  >,
) => {
  return useMutation<ChatMessage, AxiosError, ChatMessage, unknown>(
    deleteChatMessage,
    mutationOptions,
  );
};
