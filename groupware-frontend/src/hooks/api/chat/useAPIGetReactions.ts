import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatMessageReaction, UserGoodForBoard } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getReactionsURL } from 'src/utils/url/chat.url';

const getReactions = async (messageID: number) => {
  const response = await axiosInstance.get(`${getReactionsURL}/${messageID}`);
  return response.data;
};

export const useAPIGetReactions = (
  mutationOptions?: UseMutationOptions<
    ChatMessageReaction[],
    AxiosError,
    number,
    unknown
  >,
) => {
  return useMutation<ChatMessageReaction[], AxiosError, number>(
    (q) => getReactions(q),
    mutationOptions,
  );
};
