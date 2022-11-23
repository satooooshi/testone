import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatMessageReaction} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getReactionsURL} from '../../../utils/url/chat.url';

const getReactions = async (messageID: number) => {
  const response = await axiosInstance.get<ChatMessageReaction[]>(
    `${getReactionsURL}/${messageID}`,
  );
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
    q => getReactions(q),
    mutationOptions,
  );
};
