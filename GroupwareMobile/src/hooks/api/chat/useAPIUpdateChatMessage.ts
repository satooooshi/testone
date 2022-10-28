import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatMessage} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {sendChantMessageURL} from '../../../utils/url/chat.url';

const updateChatMessage = async (
  message: Partial<ChatMessage>,
): Promise<ChatMessage> => {
  const res = await axiosInstance.patch<ChatMessage>(
    sendChantMessageURL,
    message,
    {
      headers: jsonHeader,
    },
  );
  return res.data;
};

export const useAPIUpdateChatMessage = (
  mutationOptions?: UseMutationOptions<
    ChatMessage,
    AxiosError,
    Partial<ChatMessage>,
    unknown
  >,
) => {
  return useMutation<ChatMessage, AxiosError, Partial<ChatMessage>>(
    updateChatMessage,
    mutationOptions,
  );
};
