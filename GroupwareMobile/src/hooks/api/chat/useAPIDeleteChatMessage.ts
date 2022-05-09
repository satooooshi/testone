import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatMessage} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {deleteChantMessageURL} from '../../../utils/url/chat.url';

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
