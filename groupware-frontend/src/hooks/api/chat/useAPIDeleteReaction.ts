import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatMessageReaction } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteReactionURL } from 'src/utils/url/chat.url';

const deleteReaction = async (reaction: ChatMessageReaction) => {
  const response = await axiosInstance.delete<number>(
    deleteReactionURL(reaction.id.toString()),
  );
  return response.data;
};

export const useAPIDeleteReaction = (
  mutationOptions?: UseMutationOptions<
    number,
    AxiosError,
    ChatMessageReaction,
    unknown
  >,
) => {
  return useMutation<number, AxiosError, ChatMessageReaction, unknown>(
    deleteReaction,
    mutationOptions,
  );
};
