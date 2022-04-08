import {useQuery, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {ChatMessage, ChatMessageType} from '../../../types';
import {getChatMessagesURL} from '../../../utils/url/chat.url';
import {getThumbnailOfVideo} from '../../../utils/getThumbnailOfVideo';
import {AxiosError} from 'axios';

export interface GetMessagesQuery {
  group: number;
  after?: number;
  before?: number;
  include?: boolean;
}

const getMessages = async (query: GetMessagesQuery) => {
  const {group, after = '', before = '', include} = query;
  const res = await axiosInstance.get<ChatMessage[]>(
    `${getChatMessagesURL}?group=${group}&after=${after}&before=${before}&include=${include}`,
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

      if (
        m.replyParentMessage &&
        m.replyParentMessage.type === ChatMessageType.VIDEO
      ) {
        m.replyParentMessage.thumbnail = await getThumbnailOfVideo(
          m.replyParentMessage.content,
        );
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
