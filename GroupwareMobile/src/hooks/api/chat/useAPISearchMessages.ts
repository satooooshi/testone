import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatMessage} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {searchMessagesURL} from '../../../utils/url/chat.url';

export interface SearchMessageQuery {
  group: number;
  word: string;
}

const searchMessages = async (query: SearchMessageQuery) => {
  const {group, word} = query;
  const res = await axiosInstance.get<Partial<ChatMessage>[]>(
    `${searchMessagesURL}?group=${group}&word=${word}`,
  );
  return res.data;
};

export const useAPISearchMessages = (
  query: SearchMessageQuery,
  options?: UseQueryOptions<Partial<ChatMessage>[], AxiosError>,
) => {
  return useQuery<Partial<ChatMessage>[], AxiosError>(
    ['searchMessages', query],
    () => searchMessages(query),
    options,
  );
};
