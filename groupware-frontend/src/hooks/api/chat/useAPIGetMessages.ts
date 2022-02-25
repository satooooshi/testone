import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ChatMessage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getChatMessagesURL } from 'src/utils/url/chat.url';

export interface GetMessagesQuery {
  group: number;
  page?: string;
}

const getMessages = async (query: GetMessagesQuery) => {
  const { group, page = 1 } = query;
  const res = await axiosInstance.get(
    `${getChatMessagesURL}?group=${group}&page=${page}`,
  );
  return res.data;
};

export const useAPIGetMessages = (
  query: GetMessagesQuery,
  options?: UseQueryOptions<ChatMessage[], AxiosError>,
) => {
  return useQuery<ChatMessage[], AxiosError>(
    ['getMessages', query],
    () => getMessages(query),
    options,
  );
};
