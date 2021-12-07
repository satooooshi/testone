import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatMessageReaction } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveReactionURL } from 'src/utils/url/chat.url';

const saveReaction = async (reaction: Partial<ChatMessageReaction>) => {
  const response = await axiosInstance.post<ChatMessageReaction>(
    saveReactionURL,
    reaction,
  );
  return response.data;
};

export const useAPISaveReaction = (
  mutationOptions?: UseMutationOptions<
    ChatMessageReaction,
    AxiosError,
    Partial<ChatMessageReaction>,
    unknown
  >,
) => {
  return useMutation(saveReaction, mutationOptions);
};
