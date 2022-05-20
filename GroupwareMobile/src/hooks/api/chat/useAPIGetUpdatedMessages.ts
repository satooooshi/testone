import {useMutation, UseMutationOptions} from 'react-query';
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
  storedAt?: string;
}

const getUpdatedMessages = async (query: GetMessagesQuery) => {
  const {group, after = '', before = '', include, limit, storedAt = ''} = query;
  const res = await axiosInstance.get<ChatMessage[]>(
    `${getChatMessagesURL}?group=${group}&after=${after}&before=${before}&include=${include}&limit=${limit}&storedAt=${storedAt}`,
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

export const useAPIGetUpdatedMessages = (
  mutationOptions?: UseMutationOptions<
    ChatMessage[],
    AxiosError,
    GetMessagesQuery,
    unknown
  >,
) => {
  return useMutation<ChatMessage[], AxiosError, GetMessagesQuery>(
    getUpdatedMessages,
    mutationOptions,
  );
};
