import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ChatMessage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getChatMessagesURL } from 'src/utils/url/chat.url';

export interface GetMessagesQuery {
  group: number;
  limit?: string;
  after?: number;
  before?: number;
  include?: boolean;
}

const getMessages = async (query: GetMessagesQuery) => {
  const { group, after = '', before = '', include } = query;
  const res = await axiosInstance.get(
    `${getChatMessagesURL}?group=${group}&after=${after}&before=${before}&include=${include}`,
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
