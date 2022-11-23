import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatMessage} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {sendChantMessageURL} from '../../../utils/url/chat.url';

const sendChatMessage = async (
  message: Partial<ChatMessage>,
): Promise<ChatMessage> => {
  const res = await axiosInstance.post<ChatMessage>(
    sendChantMessageURL,
    message,
    {
      headers: jsonHeader,
    },
  );
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
