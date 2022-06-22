import {useQuery, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {ChatMessage, ChatMessageType} from '../../../types';
import {getChatMessagesURL} from '../../../utils/url/chat.url';
import {getThumbnailOfVideo} from '../../../utils/getThumbnailOfVideo';
import {AxiosError} from 'axios';

export interface GetMessagesQuery {
  group: number;
  limit?: number;
  after?: number;
  before?: number;
  include?: boolean;
}

const getMessages = async (query: GetMessagesQuery) => {
  const {group, after = '', before = '', include, limit} = query;
  const res = await axiosInstance.get<ChatMessage[]>(
    `${getChatMessagesURL}?group=${group}&after=${after}&before=${before}&include=${include}&limit=${limit}`,
  );
  // await Promise.all(
  //   res.data.map(async m => {
  //     if (m.type === ChatMessageType.VIDEO) {
  //       try {
  //         const thumbnail = await getThumbnailOfVideo(m.content, m.fileName);
  //         m.thumbnail = thumbnail;
  //       } catch {
  //         m.thumbnail = '';
  //       }
  //       console.log('---------', m.thumbnail);
  //     }
  //   }),
  // );
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
