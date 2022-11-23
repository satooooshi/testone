import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatMessage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { sendChantMessageURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const sendChatMessage = async (
  message: Partial<ChatMessage>,
): Promise<ChatMessage> => {
  const res = await axiosInstance.post(sendChantMessageURL, message, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPISendChatMessage = (
  mutationOptions?: UseMutationOptions<
    ChatMessage,
    AxiosError,
    Partial<ChatMessage>,
    unknown
  >,
) => {
  return useMutation<ChatMessage, AxiosError, Partial<ChatMessage>>(
    sendChatMessage,
    mutationOptions,
  );
};
