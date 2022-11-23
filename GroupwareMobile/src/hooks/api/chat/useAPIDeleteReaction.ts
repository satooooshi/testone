import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatMessageReaction} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {deleteReactionURL} from '../../../utils/url/chat.url';

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
