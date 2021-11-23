import {useQuery, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {ChatMessage, ChatMessageType} from '../../../types';
import {getChatMessagesURL} from '../../../utils/url/chat.url';
import {getThumbnailOfVideo} from '../../../utils/getThumbnailOfVideo';
import {AxiosError} from 'axios';

export interface GetMessagesQuery {
  group: number;
  page?: string;
}

const getMessages = async (query: GetMessagesQuery) => {
  const {group, page = 1} = query;
  const res = await axiosInstance.get<ChatMessage[]>(
    `${getChatMessagesURL}?group=${group}&page=${page}`,
  );
  await Promise.all(
    res.data.map(async m => {
      if (m.type === ChatMessageType.VIDEO) {
        try {
          const thumbnail = await getThumbnailOfVideo(m.content);
          m.thumbnail = thumbnail;
        } catch {
          m.thumbnail = '';
        }
      }
    }),
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
